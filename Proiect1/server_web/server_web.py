import socket
import os
import json
import gzip
import io

# creeaza un server socket
serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# specifica ca serverul va rula pe portul 5678, accesibil de pe orice ip al serverului
serversocket.bind(('', 5678))
# serverul poate accepta conexiuni; specifica cati clienti pot astepta la coada
serversocket.listen(5)

while True:
	print('#########################################################################')

	print('Serverul asculta potentiali clienti.')
	# asteapta conectarea unui client la server
	# metoda `accept` este blocanta => clientsocket, care reprezinta socket-ul corespunzator clientului conectat
	(clientsocket, address) = serversocket.accept()
	print('S-a conectat un client.')
	# se proceseaza cererea si se citeste prima linie de text
	cerere = ''
	linieDeStart = ''
	mesaj = ''

	while True:
		data = clientsocket.recv(1024)
		if len(data) < 1:
			break

		cerere = cerere + data.decode()
		print( 'S-a citit mesajul: \n---------------------------\n' + cerere + '\n---------------------------')

		pozitie = cerere.find('\r\n')
		if (pozitie > -1 and linieDeStart == ''):
			linieDeStart = cerere[0:pozitie]
			print('S-a citit linia de start din cerere: ##### ' + linieDeStart + '#####')
			break

	print('S-a terminat cititrea.')

	if linieDeStart == '':
		clientsocket.close()
		print ('S-a terminat comunicarea cu clientul - nu s-a primit niciun mesaj.')
		continue
	# interpretarea sirului de caractere `linieDeStart`
	elementeLineDeStart = linieDeStart.split()
	
	numeResursaCeruta = elementeLineDeStart[1]
	if numeResursaCeruta == '/':
		numeResursaCeruta = '/index.html'
	
	if numeResursaCeruta == '/api/utilizatori':
		poz = cerere.rfind('\r\n')
		rawdata = cerere[poz:]

		jsondata = json.loads(rawdata)

		with open("../continut/resurse/utilizatori.json", "r") as inf:
			data = json.load(inf)
		
		data.append(jsondata)

		with open("../continut/resurse/utilizatori.json", "w") as outf:
			json.dump(data,outf)
		clientsocket.close()
		print ('S-a terminat comunicarea cu clientul.')
	else:
		# calea este relativa la directorul de unde a fost executat scriptul
		numeFisier = '../continut' + numeResursaCeruta
		
		fisier = None
		try:
			# deschide fisierul pentru citire in mod binar
			fisier = open(numeFisier,'rb')

			# tip media
			numeExtensie = numeFisier[numeFisier.rfind('.')+1:]
			tipuriMedia = {
				'html': 'text/html; charset=utf-8',
				'css': 'text/css; charset=utf-',
				'js': 'text/javascript; charset=utf-8',
				'png': 'image/png',
				'jpg': 'image/jpeg',
				'jpeg': 'image/jpeg',
				'gif': 'image/gif',
				'ico': 'image/x-icon',
				'xml': 'application/xml; charset=utf-8',
				'json': 'application/json; charset=utf-8'
			}
			tipMedia = tipuriMedia.get(numeExtensie,'text/plain; charset=utf-8')
			
			# buffer pentru a pastra continutul comprimat
			compressed_data = io.BytesIO()
			with gzip.GzipFile(fileobj=compressed_data, mode='w') as gzip_file:
				# Citeste fisierul si scrie datele comprimate in buffer
				buf = fisier.read(1024)
				while buf:
					gzip_file.write(buf)
					buf = fisier.read(1024)
			
			# Obtine datele comprimate ca octeti
			compressed_content = compressed_data.getvalue()

			# Trimite headers de raspuns HTTP
			headers = [
				b'HTTP/1.1 200 OK\r\n',
				b'Content-Length: ' + str(len(compressed_content)).encode() + b'\r\n',
				b'Content-Encoding: gzip\r\n',
				b'Content-Type: ' + tipMedia.encode() + b'\r\n',
				b'Server: My PW Server\r\n',
				b'\r\n'
			]
			clientsocket.sendall(b''.join(headers))

			# Trimite conținutul comprimat catre client
			clientsocket.sendall(compressed_content)
				
		except IOError:
			# daca fisierul nu exista trebuie trimis un mesaj de 404 Not Found
			msg = 'Eroare! Resursa ceruta ' + numeResursaCeruta + ' nu a putut fi gasita!'
			print (msg)
			mesaj = bytes('HTTP/1.1 404 Not Found\r\n','utf-8')
			clientsocket.sendall(mesaj)
			mesaj = bytes('Content-Length: ' + str(len(msg)) + '\r\n','utf-8')
			clientsocket.sendall(mesaj)
			mesaj = bytes('Content-Type: text/plain; charset=utf-8\r\n')
			clientsocket.sendall(mesaj)
			mesaj = bytes('Server: My PW Server\r\n','utf-8')
			clientsocket.sendall(mesaj)
			mesaj = bytes('\r\n','utf-8')
			clientsocket.sendall(mesaj)
			mesaj = bytes('Eroare! Resursa ceruta ' + numeResursaCeruta + ' nu a putut fi gasita!','utf-8')
			clientsocket.sendall(mesaj)

		finally:
			if fisier is not None:
				fisier.close()
		clientsocket.close()
		print ('S-a terminat comunicarea cu clientul.')

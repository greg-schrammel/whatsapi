module main

require (
	cloud.google.com/go/firestore v1.0.0 // indirect
	cloud.google.com/go/storage v1.1.0 // indirect
	firebase.google.com/go v3.9.0+incompatible // indirect
	github.com/Rhymen/go-whatsapp v0.0.2
	github.com/fauna/faunadb-go v2.0.0+incompatible // indirect
	github.com/pusher/pusher-http-go v4.0.0+incompatible // indirect
	google.golang.org/api v0.11.0 // indirect
)

replace github.com/Rhymen/go-whatsapp => ./lib

go 1.13

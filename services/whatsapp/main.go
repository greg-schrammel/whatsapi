package main

import (
	"encoding/base64"
	"flag"
	"log"
	"net/http"
	"os"
	"time"

	firebase "firebase.google.com/go"
	whatsapp "github.com/Rhymen/go-whatsapp"
	"github.com/gorilla/websocket"
	"golang.org/x/net/context"
	"google.golang.org/api/option"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func firebaseApp(ctx context.Context) *firebase.App {
	googleCredentials, decodingErr := base64.StdEncoding.DecodeString(os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"))
	if decodingErr != nil {
		log.Fatal(decodingErr)
	}
	opt := option.WithCredentialsJSON(googleCredentials)
	app, firebaseErr := firebase.NewApp(ctx, &firebase.Config{
		DatabaseURL: "https://ilikebread-fb4b2.firebaseio.com",
	}, opt)
	if firebaseErr != nil {
		log.Fatal(firebaseErr)
	}
	return app
}

func handler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	firebaseApp := firebaseApp(ctx)
	db, dbErr := firebaseApp.Database(ctx)
	if dbErr != nil {
		log.Fatal(dbErr)
	}

	whatsAppConn, whatsAppConnErr := whatsapp.NewConn(5 * time.Second)
	if whatsAppConnErr != nil {
		log.Fatal(whatsAppConnErr)
	}

	wsConn, wsConnErr := upgrader.Upgrade(w, r, nil)
	if wsConnErr != nil {
		log.Fatal(wsConnErr)
		return
	}

	qr := make(chan string)
	go func() {
		for {
			wsConn.WriteMessage(websocket.TextMessage, []byte("qr,"+<-qr))
		}
	}()

	session, loginErr := whatsAppConn.Login(qr)
	if loginErr != nil {
		log.Fatal(loginErr)
	}

	sessionRef, saveSessionErr := db.NewRef("whatsapp_sessions").Push(ctx, session)
	if saveSessionErr != nil {
		log.Fatal(saveSessionErr)
	}

	wsConn.WriteMessage(websocket.TextMessage, []byte("id,"+sessionRef.Key))
}

var addr = flag.String("addr", ":3000", "http service address")

func main() {
	flag.Parse()
	http.HandleFunc("/w", handler)
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

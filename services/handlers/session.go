package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"time"

	whatsapp "../lib/whatsapp"
	utils "./utils"
	"github.com/gorilla/websocket"
	"golang.org/x/net/context"
)

func checkOrigin(r *http.Request) bool {
	if os.Getenv("ENV") != "production" {
		return true
	}
	return false
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     checkOrigin,
}

func handler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	firebaseApp, firebaseAppErr := utils.MakeFirebaseApp(ctx)
	if firebaseAppErr != nil {
		log.Fatal(firebaseAppErr)
	}
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
			log.Print(<-qr)
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

var addr = flag.String("addr", ":3001", "http service address")

func main() {
	flag.Parse()
	http.HandleFunc("/w", handler)
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

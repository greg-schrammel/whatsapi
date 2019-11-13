package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"encoding/base64"
	"os"

	firebase "firebase.google.com/go"

	"google.golang.org/api/option"

	whatsapp "github.com/Rhymen/go-whatsapp"
	"golang.org/x/net/context"
)

func makeFirebaseApp(ctx context.Context) (*firebase.App, error) {
	googleCredentials, decodingErr := base64.StdEncoding.DecodeString(os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"))
	if decodingErr != nil {
		return nil, fmt.Errorf("google credentials: %v", decodingErr)
	}
	opt := option.WithCredentialsJSON(googleCredentials)
	app, firebaseErr := firebase.NewApp(ctx, &firebase.Config{
		DatabaseURL: "https://ilikebread-fb4b2.firebaseio.com",
	}, opt)
	if firebaseErr != nil {
		return nil, fmt.Errorf("firebase app: %v", firebaseErr)
	}
	return app, nil
}

func restoreWhatsSession(sessionID string, whatsAppConn *whatsapp.Conn) error {
	ctx := context.Background()
	firebaseApp, firebaseAppErr := makeFirebaseApp(ctx)
	if firebaseAppErr != nil {
		return fmt.Errorf("error instancing new firebase app")

	}
	db, dbErr := firebaseApp.Database(ctx)
	if dbErr != nil {
		return fmt.Errorf("firebase database error")
	}
	sessionDbRef := db.NewRef("whatsapp_sessions/" + sessionID)

	var session whatsapp.Session
	saveSessionErr := sessionDbRef.Get(ctx, &session)
	if saveSessionErr != nil {
		return fmt.Errorf("error retrieving session")
	}

	restoredSession, restoreSessionErr := whatsAppConn.RestoreWithSession(session)
	if restoreSessionErr != nil {
		return fmt.Errorf("error restoring session")
	}

	saveNewSessionErr := sessionDbRef.Set(ctx, restoredSession)
	if saveNewSessionErr != nil {
		log.Fatal(saveNewSessionErr)
	}

	return nil
}

type sendMessageRequest struct {
	Session string
	Message string
	To      string
}

// Handler ihu
func Handler(w http.ResponseWriter, req *http.Request) {
	var decodedRequest sendMessageRequest
	decodeRequestErr := json.NewDecoder(req.Body).Decode(&decodedRequest)
	if decodeRequestErr != nil {
		http.Error(w, "error decoding request body", http.StatusBadRequest)
		return
	}
	log.Println(decodedRequest)
	if decodedRequest.Session == "" {
		http.Error(w, "a session is required", http.StatusBadRequest)
		return
	}

	whatsAppConn, whatsConnErr := whatsapp.NewConn(50 * time.Second)
	if whatsConnErr != nil {
		http.Error(w, "error connecting to whatsapp", http.StatusInternalServerError)
		return
	}

	restoringSessionErr := restoreWhatsSession(decodedRequest.Session, whatsAppConn)
	if restoringSessionErr != nil {
		http.Error(w, restoringSessionErr.Error(), http.StatusInternalServerError)
		return
	}

	msgID, sendMessageErr := whatsAppConn.Send(whatsapp.TextMessage{
		Info: whatsapp.MessageInfo{
			RemoteJid: decodedRequest.To + "@s.whatsapp.net",
		},
		Text: decodedRequest.Message,
	})
	if sendMessageErr != nil {
		http.Error(w, "error sending message"+sendMessageErr.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Fprintf(w, "Message Sent, id: "+msgID)
}


"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";

interface Message {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp;
}

interface AuctionChatProps {
  auctionId: string;
}

const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
}


export default function AuctionChat({ auctionId }: AuctionChatProps) {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!auctionId) return;

    const q = query(
      collection(db, "auctions", auctionId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    });

    return unsubscribe;
  }, [auctionId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || isSending) return;

    setIsSending(true);
    const messagesRef = collection(db, "auctions", auctionId, "messages");
    
    try {
        await addDoc(messagesRef, {
            text: newMessage,
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
        });
        setNewMessage("");
    } catch (error) {
        console.error("Error sending message:", error);
    } finally {
        setIsSending(false);
    }
  };
  
  if (authLoading) {
    return (
         <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 font-headline"><MessageSquare /> Auction Chat</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4 h-64 pr-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-10 w-1/2 ml-auto" />
                    <Skeleton className="h-10 w-3/4" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 font-headline"><MessageSquare /> Auction Chat</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4 h-64 overflow-y-auto pr-4 mb-4 border-b pb-4">
          {messages.map((message) => {
             const isCurrentUser = user && message.uid === user.uid;
             return (
                <div key={message.id} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
                    {!isCurrentUser && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={message.photoURL ?? undefined} />
                            <AvatarFallback>{getInitials(message.displayName)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={`p-3 rounded-lg max-w-xs ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                        {!isCurrentUser && <p className="text-xs font-bold mb-1">{message.displayName}</p>}
                        <p className="text-sm">{message.text}</p>
                         <p className="text-xs opacity-70 mt-1 text-right">{message.createdAt?.toDate().toLocaleTimeString()}</p>
                    </div>
                     {isCurrentUser && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={message.photoURL ?? undefined} />
                            <AvatarFallback>{getInitials(message.displayName)}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
             )
          })}
          <div ref={messagesEndRef} />
          {messages.length === 0 && <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={!user || isSending}
          />
          <Button type="submit" disabled={!user || !newMessage.trim() || isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

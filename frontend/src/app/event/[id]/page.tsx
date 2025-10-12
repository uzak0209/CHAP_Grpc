"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Heart, MessageCircle } from 'lucide-react';


import { eventServiceGetEventByID } from '@/api/event';
// events don't have dedicated comment endpoints in this API; show description and image instead
import type { V1Event } from '@/api/event.schemas.ts/v1Event';
import type { V1CreateCommentRequest } from '@/api/comment.schemas.ts';

const ResponseItem = ({
  number,
  content,
  userName,
  createdTime,
  isOP = false,
}: {
  number: number;
  content: string;
  userName: string;
  createdTime: string;
  isOP?: boolean;
}) => (
  <div className="border-b border-gray-200 py-3 hover:bg-gray-50">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0">
        <span
          className={`inline-block px-2 py-1 text-xs font-mono rounded ${
            isOP ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700"
          }`}
        >
          {number}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <span className="font-mono">{isOP ? "★" + userName : userName}</span>
          <span>{new Date(createdTime).toLocaleString("ja-JP")}</span>
          {isOP && <span className="text-red-600 font-bold">[投稿者]</span>}
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</div>
      </div>
    </div>
  </div>
);

const EventHeader = ({ event, replyCount }: { event: V1Event; replyCount: number }) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
    <h1 className="text-lg font-bold text-green-900 mb-2">{event.content}</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-green-700">
      <div className="flex items-center gap-1">
        <MessageCircle className="w-3 h-3" />
        <span>レス数: {replyCount}</span>
      </div>
      <div className="flex items-center gap-1">
        <Heart className="w-3 h-3" />
        <span>{event.likeCount ?? 0}</span>
      </div>
    </div>
  </div>
);

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;


  const [event, setEvent] = useState<V1Event | undefined>(undefined);


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await eventServiceGetEventByID(eventId);
        if (!mounted) return;
        setEvent((res.data as any).event as V1Event);
      } catch (err) {
        console.error('Failed to fetch event by id:', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  if (!event) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center text-gray-500 mt-8">
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Button onClick={() => router.back()} variant="outline" className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        戻る
      </Button>

      <EventHeader event={event} replyCount={0} />

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="prose max-w-none">
            {event.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.image} alt="event image" className="w-full rounded-md mb-4" />
            )}
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{event.content ?? ''}</div>
            {event.eventDate && (
              <div className="mt-4 text-xs text-gray-500">開催日時: {new Date(event.eventDate).toLocaleString('ja-JP')}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

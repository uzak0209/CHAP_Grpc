"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users } from "lucide-react";

import { useGetEvents } from "@/hooks/use-event";
import { useLocationStore, captureCurrentLocation } from "@/store/useLocation";
import type { V1Event } from "@/api/event.schemas.ts/v1Event";

// イベントカードコンポーネント
const EventCard = ({ event }: { event: V1Event }) => {
	const router = useRouter();

		return (
			<Card className="w-full transition-all hover:shadow-md hover:-translate-y-1">
				<CardHeader>
					<CardTitle className="text-xl font-bold">{event.content}</CardTitle>
				<CardDescription className="flex items-center text-sm text-gray-500 pt-2">
					<Users className="w-4 h-4 mr-2" />
					<span>作成者: {event.userName ?? event.userId ?? 'unknown'}</span>
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="flex items-center">
					<Calendar className="w-5 h-5 mr-3 text-gray-600" />
					<div>
						<p className="font-semibold">開催日時</p>
						<p>{new Date(event.eventDate ?? event.createdAt ?? '').toLocaleString()}</p>
					</div>
				</div>
				<div className="flex items-center justify-between">
					  <div className="text-sm text-gray-500">{/* place info not available on V1Event */}</div>
					<Button 
						variant="outline"
						size="sm"
						onClick={() => router.push(`/event/${event.id}`)}
					>
						詳細を見る
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default function EventsPage() {
	const [sortBy, setSortBy] = useState<'time' | 'distance'>('time');
	const router = useRouter();

	const currentLocation = useLocationStore((s) => s.currentLocation);
	const locationParams = currentLocation && currentLocation.isSome && currentLocation.isSome()
		? { lat: currentLocation.unwrap().lat, lng: currentLocation.unwrap().lng }
		: undefined;

	useEffect(() => {
		const hasLoc = currentLocation && currentLocation.isSome && currentLocation.isSome();
		if (!hasLoc) {
			captureCurrentLocation().catch(() => {});
		}
	}, [currentLocation]);

	const eventsQuery = useGetEvents(locationParams);

	const events = eventsQuery.data?.events ?? [];
	const loading = eventsQuery.isLoading;
	const fetchError = eventsQuery.isError ? eventsQuery.error : undefined;

	const sortedEvents = useMemo(() => {
		return [...events].sort((a, b) => {
		if (sortBy === 'time') {
		return new Date(b.eventDate ?? b.createdAt ?? '').getTime() - new Date(a.eventDate ?? a.createdAt ?? '').getTime();
			}
			// TODO: distance sort
			return 0;
		});
	}, [events, sortBy]);

	const renderContent = () => {
		if (!locationParams) {
			return (
				<div className="flex flex-col items-center justify-center min-h-[60vh]">
					<Skeleton className="w-12 h-12 rounded-full" />
					<p className="mt-4 text-lg text-gray-600">位置情報を取得しています...</p>
				</div>
			);
		}

		if (loading) {
			return (
				<div className="flex flex-col items-center justify-center min-h-[60vh]">
					<Skeleton className="w-12 h-12 rounded-full" />
					<p className="mt-4 text-lg text-gray-600">近くのイベントを探しています...</p>
				</div>
			);
		}

		if (fetchError) {
			return (
				<div className="text-center py-10">
					<p className="text-red-500 mb-4">イベントの読み込みに失敗しました</p>
					<Button onClick={() => eventsQuery.refetch()}>再試行</Button>
				</div>
			);
		}

		if (sortedEvents.length === 0) {
			return (
				<div className="text-center py-10">
					<p className="text-gray-500">近くで開催予定のイベントはありません。</p>
				</div>
			);
		}

		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{sortedEvents.map((ev) => (
					<EventCard key={ev.id} event={ev} />
				))}
			</div>
		);
	};

	return (
		<div className="container mx-auto p-4 md:p-6">
			<header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
				<h1 className="text-3xl font-bold text-gray-800">近くのイベント</h1>
				<div className="flex items-center gap-4">
					<Button variant="outline" onClick={() => router.push('/events/create')}>イベントを作成</Button>
					<Select onValueChange={(value: 'time' | 'distance') => setSortBy(value)} defaultValue={sortBy}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="並び替え" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="time">開催日順</SelectItem>
							<SelectItem value="distance">距離順</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</header>

			<main>
				{renderContent()}
			</main>
		</div>
	);
}


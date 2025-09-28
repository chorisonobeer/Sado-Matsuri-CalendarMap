import React, { useMemo } from 'react';

interface EventBar {
  event: Pwamap.FestivalData;
  startDate: Date;
  endDate: Date;
  startCol: number;
  span: number;
  row: number;
  color: string;
}

interface CalendarEventBarsProps {
  events: Pwamap.FestivalData[];
  calendarDays: Date[];
  getEventColor: (eventName: string) => string;
  onEventClick: (event: Pwamap.FestivalData) => void;
}

const CalendarEventBars: React.FC<CalendarEventBarsProps> = ({
  events,
  calendarDays,
  getEventColor,
  onEventClick
}) => {
  // 複数日イベントのバーを計算
  const eventBars = useMemo(() => {
    const bars: EventBar[] = [];
    const monthStart = calendarDays[0];
    const monthEnd = calendarDays[calendarDays.length - 1];

    events.forEach(event => {
      const startDate = new Date(event.開始日);
      const endDate = new Date(event.終了日);
      
      // 1日だけのイベントはバー表示しない
      if (startDate.toDateString() === endDate.toDateString()) {
        return;
      }

      // 月の範囲内での連続期間を計算
      let currentStart = new Date(Math.max(startDate.getTime(), monthStart.getTime()));
      let currentEnd = new Date(Math.min(endDate.getTime(), monthEnd.getTime()));

      // 連続する日程を検出してバーを作成
      while (currentStart <= currentEnd) {
        const startCol = calendarDays.findIndex(day => 
          day.toDateString() === currentStart.toDateString()
        );
        
        if (startCol === -1) break;

        // 連続する日数を計算（週をまたがない範囲で）
        const startWeek = Math.floor(startCol / 7);
        let span = 1;
        let checkDate = new Date(currentStart);
        
        while (span < 7 && checkDate < currentEnd) {
          checkDate.setDate(checkDate.getDate() + 1);
          const nextCol = startCol + span;
          const nextWeek = Math.floor(nextCol / 7);
          
          // 週をまたぐ場合は停止
          if (nextWeek !== startWeek) break;
          
          // 月の範囲を超える場合は停止
          if (nextCol >= calendarDays.length) break;
          
          span++;
        }

        bars.push({
          event,
          startDate: new Date(currentStart),
          endDate: new Date(Math.min(checkDate.getTime(), currentEnd.getTime())),
          startCol,
          span,
          row: startWeek,
          color: getEventColor(event.お祭り名)
        });

        // 次の週の開始に移動
        currentStart = new Date(checkDate);
        currentStart.setDate(currentStart.getDate() + 1);
      }
    });

    return bars;
  }, [events, calendarDays, getEventColor]);

  return (
    <div className="calendar-event-bars">
      {eventBars.map((bar, index) => (
        <div
          key={`${bar.event.お祭り名}-${bar.startCol}-${index}`}
          className="event-bar"
          style={{
            backgroundColor: bar.color,
            gridColumn: `${bar.startCol + 1} / span ${bar.span}`,
            gridRow: bar.row + 2, // ヘッダー行の後
          }}
          onClick={() => onEventClick(bar.event)}
          title={`${bar.event.お祭り名} (${bar.startDate.toLocaleDateString()} - ${bar.endDate.toLocaleDateString()})`}
        >
          <span className="event-bar-text">{bar.event.お祭り名}</span>
        </div>
      ))}
    </div>
  );
};

export default CalendarEventBars;

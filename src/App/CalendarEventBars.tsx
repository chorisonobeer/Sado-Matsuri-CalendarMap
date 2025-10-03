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

    // 複数日イベントをフィルタリング
    const multiDayEvents = events.filter(event => {
      const startDate = new Date(event.開始日);
      const endDate = new Date(event.終了日);
      
      // 開始日と終了日が異なる場合のみ（複数日イベント）
      return startDate.toDateString() !== endDate.toDateString();
    });

    multiDayEvents.forEach(event => {
      const startDate = new Date(event.開始日);
      const endDate = new Date(event.終了日);
      
      // 月の範囲内での表示期間を計算
      const displayStart = new Date(Math.max(startDate.getTime(), monthStart.getTime()));
      const displayEnd = new Date(Math.min(endDate.getTime(), monthEnd.getTime()));

      // 週ごとに分割してバーを作成
      let currentStart = new Date(displayStart);
      
      while (currentStart <= displayEnd) {
        const currentStartString = currentStart.toDateString();
        const startCol = calendarDays.findIndex(day => 
          day.toDateString() === currentStartString
        );
        
        if (startCol === -1) break;

        // 現在の週の範囲を計算
        const startWeek = Math.floor(startCol / 7);
        const weekEndCol = Math.min((startWeek + 1) * 7 - 1, calendarDays.length - 1);
        
        // 週内での連続日数を計算
        let span = 1;
        let checkDate = new Date(currentStart);
        
        while (startCol + span <= weekEndCol && checkDate < displayEnd) {
          checkDate.setDate(checkDate.getDate() + 1);
          
          // 月の範囲を超える場合は停止
          if (startCol + span >= calendarDays.length) break;
          
          // 連続する日かチェック
          const nextDay = calendarDays[startCol + span];
          if (nextDay && nextDay.toDateString() === checkDate.toDateString()) {
            span++;
          } else {
            break;
          }
        }

        // バーを作成
        const barEndDate = new Date(Math.min(checkDate.getTime(), displayEnd.getTime()));
        
        bars.push({
          event,
          startDate: new Date(currentStart),
          endDate: barEndDate,
          startCol,
          span,
          row: startWeek,
          color: getEventColor(event.お祭り名)
        });

        // 次の週の開始日に移動
        currentStart = new Date(checkDate);
        currentStart.setDate(currentStart.getDate() + 1);
        
        // 表示終了日を超えた場合は終了
        if (currentStart > displayEnd) break;
      }
    });

    // バーの重複を避けるため、同じ行の場合は少しずらす
    const sortedBars = bars.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.startCol - b.startCol;
    });

    return sortedBars;
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

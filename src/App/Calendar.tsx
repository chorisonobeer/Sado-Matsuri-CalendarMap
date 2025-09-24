import React, { useState, useMemo, useCallback } from 'react';
import './Calendar.scss';
import EventModal from './EventModal'; // イベント詳細モーダルを再利用

interface CalendarProps {
  data: Pwamap.FestivalData[];
}

const Calendar: React.FC<CalendarProps> = ({ data }) => {
  const [currentDate, setCurrentDate] = useState(new Date()); // 現在表示している月の基準日
  const [selectedDateEvents, setSelectedDateEvents] = useState<Pwamap.FestivalData[]>([]); // 選択した日付のイベント
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 月の最初の日と最後の日を取得
  const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
  const lastDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), [currentDate]);

  // カレンダーのグリッドを生成
  const calendarDays = useMemo(() => {
    const days = [];
    const startDay = new Date(firstDayOfMonth);
    startDay.setDate(startDay.getDate() - startDay.getDay()); // 週の最初の日曜日に合わせる

    for (let i = 0; i < 42; i++) { // 6週間分 (最大42日)
      const day = new Date(startDay);
      day.setDate(startDay.getDate() + i);
      days.push(day);
    }
    return days;
  }, [firstDayOfMonth]);

  // 月ごとのイベントをフィルタリング
  const eventsInMonth = useMemo(() => {
    return data.filter(event => {
      const eventStartDate = Date.parse(event['開始日'] || '');
      const eventEndDate = Date.parse(event['終了日'] || event['開始日'] || ''); // 終了日がない場合は開始日を使用

      if (!eventStartDate || !eventEndDate) return false;

      const start = new Date(eventStartDate);
      const end = new Date(eventEndDate);

      // イベントが現在の月に含まれるかチェック
      return (
        (start.getMonth() === currentDate.getMonth() && start.getFullYear() === currentDate.getFullYear()) ||
        (end.getMonth() === currentDate.getMonth() && end.getFullYear() === currentDate.getFullYear()) ||
        (start < firstDayOfMonth && end > lastDayOfMonth) // 月をまたぐイベント
      );
    });
  }, [data, currentDate, firstDayOfMonth, lastDayOfMonth]);

  // 特定の日のイベントを取得
  const getEventsForDate = useCallback((date: Date) => {
    return eventsInMonth.filter(event => {
      const eventStartDate = Date.parse(event['開始日'] || '');
      const eventEndDate = Date.parse(event['終了日'] || event['開始日'] || '');

      if (!eventStartDate || !eventEndDate) return false;

      const start = new Date(eventStartDate);
      const end = new Date(eventEndDate);

      // イベントが指定された日付に含まれるかチェック
      return date >= start && date <= end;
    }).sort((a, b) => {
      // 開始日、重み付け、お祭り名でソート
      const dateA = Date.parse(a['開始日'] || '');
      const dateB = Date.parse(b['開始日'] || '');
      if (dateA !== dateB) return dateA - dateB;

      // 重み付けはまだないので、お祭り名でソート
      return (a['お祭り名'] || '').localeCompare(b['お祭り名'] || '', 'ja');
    });
  }, [eventsInMonth]);

  // 日付クリックハンドラ
  const handleDateClick = useCallback((date: Date) => {
    const events = getEventsForDate(date);
    if (events.length > 0) {
      setSelectedDateEvents(events);
      setIsModalOpen(true);
    }
  }, [getEventsForDate]);

  // モーダルを閉じるハンドラ
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDateEvents([]);
    // onSelectShop(undefined); // 選択状態をクリア (削除)
  }, []); // onSelectShopを依存配列から削除

  // 月の移動
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
  }, []);

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth}>&lt;</button>
        <h2>{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</h2>
        <button onClick={goToNextMonth}>&gt;</button>
      </div>
      <div className="calendar-grid">
        {[ '日', '月', '火', '水', '木', '金', '土' ].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          return (
            <div
              key={index}
              className={`calendar-day ${isToday ? 'today' : ''} ${isCurrentMonth ? '' : 'other-month'}`}
              onClick={() => handleDateClick(day)}
            >
              <span className="day-number">{day.getDate()}</span>
              <div className="day-events">
                {dayEvents.slice(0, 2).map(event => ( // 最大2件表示
                  <div key={event.index} className="event-title">{event['お祭り名']}</div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="more-events">+ {dayEvents.length - 2}件</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && selectedDateEvents.length > 0 && (
        <EventModal
          event={selectedDateEvents[0]} // 最初のイベントをモーダルに表示（要件に合わせて調整）
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Calendar;

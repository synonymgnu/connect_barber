export default function CalendarStyles() {
    return (
      <style jsx global>{`
        .fc {
          background-color: #0F0F0F !important;
          color: white !important;
        }
        .fc-toolbar-chunk {
          display: flex !important;
          gap: 0.5rem !important;
          align-items: center !important;
        }
        .fc .fc-button {
          background-color: #8161FF !important;
          border-color: #8161FF !important;
          color: white !important;
          font-weight: 600 !important;
          border-radius: 0.5rem !important;
          padding: 0.5rem 0.75rem !important;
          margin-left: 0.5rem !important;
        }
        .fc .fc-button:first-child {
          margin-left: 0 !important;
        }
        .fc .fc-button:hover {
          background-color: #6a4dff !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 8px rgba(129, 97, 255, 0.4) !important;
        }
        .fc .fc-toolbar-title {
          color: white !important;
          font-weight: 600 !important;
        }
        .fc-daygrid-day-frame, .fc-timegrid-col-frame {
          background-color: #151515 !important;
        }
        .fc-col-header-cell {
          background-color: #1A1A1A !important;
        }
        .fc-timegrid-slot {
          border-top: 1px dotted #333 !important;
        }
        .fc-event {
          cursor: move !important;
        }
      `}</style>
    );
  }
// app/dashboard/calendar/utils.ts
export const getEventColorByStatus = (status: string): string => {
    switch (status) {
      case 'confirmado': return '#4CAF50';
      case 'faltou': return '#F44336';
      default: return '#8161FF';
    }
  };
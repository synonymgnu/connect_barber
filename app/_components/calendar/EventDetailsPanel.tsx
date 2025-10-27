interface EventDetailsPanelProps {
  selectedEvent: any;
  onClose: () => void;
}

export default function EventDetailsPanel({ selectedEvent, onClose }: EventDetailsPanelProps) {
  if (!selectedEvent) {
    return (
      <div className="lg:w-80 bg-[#151515] rounded-xl border border-[#2A2A2A] p-4 text-center text-gray-500">
        Clique em um agendamento para ver os detalhes.
      </div>
    );
  }

  return (
    <div className="lg:w-80 bg-[#151515] rounded-xl border border-[#2A2A2A] p-4">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-bold text-white">Detalhes do Agendamento</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-400">Cliente</p>
          <p className="text-white font-medium">{selectedEvent.customer || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Telefone</p>
          <p className="text-white">{selectedEvent.phone || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Serviço</p>
          <p className="text-white">{selectedEvent.service || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Horário</p>
          <p className="text-white">
            {selectedEvent.start?.toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {' – '}
            {selectedEvent.end?.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Status</p>
          <span
            className={`inline-block px-2 py-1 text-xs rounded ${
              selectedEvent.status === 'confirmado'
                ? 'bg-green-500/20 text-green-400'
                : selectedEvent.status === 'faltou'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-[#8161FF]/20 text-[#8161FF]'
            }`}
          >
            {selectedEvent.status === 'agendado'
              ? 'Agendado'
              : selectedEvent.status === 'confirmado'
              ? 'Confirmado'
              : 'Faltou'}
          </span>
        </div>
      </div>
    </div>
  );
}
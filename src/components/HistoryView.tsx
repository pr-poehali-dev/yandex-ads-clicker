import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Transaction {
  id: number;
  amount: number;
  currency: string;
  amount_cny: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  payment_details?: {
    recipient_name: string;
    account_number: string;
  };
}

interface HistoryViewProps {
  transactions: Transaction[];
  onBack: () => void;
}

const HistoryView = ({ transactions, onBack }: HistoryViewProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Icon name="CheckCircle" className="text-green-500" size={20} />;
      case 'pending':
        return <Icon name="Clock" className="text-yellow-500" size={20} />;
      case 'failed':
        return <Icon name="XCircle" className="text-red-500" size={20} />;
      default:
        return <Icon name="Circle" className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'pending':
        return 'В обработке';
      case 'failed':
        return 'Отклонено';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-500 via-blue-400 to-sky-400">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      <div className="max-w-2xl mx-auto pt-8 relative z-10">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 text-white hover:bg-white/20"
        >
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>

        <Card className="p-8 bg-white/95 backdrop-blur border-0 shadow-2xl rounded-3xl">
          <div className="text-center space-y-2 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-2 flex items-center justify-center">
              <Icon name="Clock" className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">История операций</h2>
            <p className="text-gray-600">Все ваши пополнения</p>
          </div>

          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Icon name="Inbox" size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Пока нет операций</p>
                <p className="text-sm">Сделайте первое пополнение</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(transaction.status)}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {transaction.currency === 'CNY' 
                          ? `¥ ${transaction.amount_cny}` 
                          : `₽ ${transaction.amount} (¥ ${transaction.amount_cny})`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-700">
                      {getStatusText(transaction.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HistoryView;
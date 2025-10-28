import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type View = 'main' | 'topup' | 'history' | 'help' | 'admin';

interface MainViewProps {
  onNavigate: (view: View) => void;
  onTopupStart: () => void;
}

const MainView = ({ onNavigate, onTopupStart }: MainViewProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-lg mb-4">
            <h1 className="text-4xl font-bold text-white">Alipay</h1>
          </div>
          <p className="text-lg text-gray-600">Быстрое и безопасное пополнение</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onTopupStart}
            className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300 text-white border-0"
          >
            <Icon name="Wallet" className="mr-3" size={24} />
            Пополнить кошелёк
          </Button>

          <Button
            onClick={() => onNavigate('history')}
            className="w-full h-14 text-base font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 shadow-sm"
            variant="outline"
          >
            <Icon name="Clock" className="mr-2" size={20} />
            История операций
          </Button>

          <Button
            onClick={() => onNavigate('help')}
            className="w-full h-14 text-base font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 shadow-sm"
            variant="outline"
          >
            <Icon name="HelpCircle" className="mr-2" size={20} />
            Помощь
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MainView;
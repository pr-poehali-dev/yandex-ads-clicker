import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type View = 'main' | 'topup' | 'history' | 'help' | 'admin';

interface MainViewProps {
  onNavigate: (view: View) => void;
  onTopupStart: () => void;
}

const MainView = ({ onNavigate, onTopupStart }: MainViewProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-500 via-blue-400 to-sky-400">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white rounded-3xl shadow-2xl mb-6">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#1677FF"/>
              <path d="M24 12C17.373 12 12 17.373 12 24s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10z" fill="white"/>
              <circle cx="24" cy="24" r="6" fill="white"/>
            </svg>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Alipay</h1>
          </div>
          <p className="text-lg text-white font-medium drop-shadow-md">Быстрое и безопасное пополнение</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onTopupStart}
            className="w-full h-16 text-lg font-semibold bg-white hover:bg-gray-50 transition-all duration-300 text-blue-600 border-0 shadow-xl hover:shadow-2xl"
          >
            <Icon name="Wallet" className="mr-3" size={24} />
            Пополнить кошелёк
          </Button>

          <Button
            onClick={() => onNavigate('history')}
            className="w-full h-14 text-base font-medium bg-white/90 hover:bg-white text-blue-700 border-0 shadow-lg backdrop-blur"
            variant="outline"
          >
            <Icon name="Clock" className="mr-2" size={20} />
            История операций
          </Button>

          <Button
            onClick={() => onNavigate('help')}
            className="w-full h-14 text-base font-medium bg-white/90 hover:bg-white text-blue-700 border-0 shadow-lg backdrop-blur"
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
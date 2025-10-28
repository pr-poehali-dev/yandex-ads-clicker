import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface HelpViewProps {
  onBack: () => void;
}

const HelpView = ({ onBack }: HelpViewProps) => {
  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <div className="max-w-2xl mx-auto pt-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6"
        >
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>

        <Card className="p-8 bg-white border-0 shadow-2xl rounded-2xl">
          <div className="text-center space-y-2 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-2 flex items-center justify-center">
              <Icon name="HelpCircle" className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Помощь</h2>
            <p className="text-gray-600">Как пользоваться сервисом</p>
          </div>

          <div className="space-y-5">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm">1</div>
                Как пополнить?
              </h3>
              <p className="text-sm text-gray-600 pl-8">
                Нажмите "Пополнить кошелёк", выберите валюту, введите сумму, загрузите QR-код и получите реквизиты
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm">2</div>
                Какой курс?
              </h3>
              <p className="text-sm text-gray-600 pl-8">
                1 юань = 11.40 рублей. При выборе рублей сумма автоматически конвертируется
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm">3</div>
                Сколько ждать?
              </h3>
              <p className="text-sm text-gray-600 pl-8">
                Обычно деньги приходят в течение 5-10 минут после оплаты
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm">4</div>
                Возникли проблемы?
              </h3>
              <p className="text-sm text-gray-600 pl-8">
                Свяжитесь с нами: support@alipaybot.com
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white font-semibold"
              onClick={() => window.open('mailto:support@alipaybot.com')}
            >
              <Icon name="Mail" className="mr-2" size={20} />
              Написать в поддержку
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HelpView;

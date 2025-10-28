import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type View = 'main' | 'topup' | 'history' | 'help';
type TopupStep = 'amount' | 'qr' | 'details';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
}

const Index = () => {
  const [view, setView] = useState<View>('main');
  const [topupStep, setTopupStep] = useState<TopupStep>('amount');
  const [amount, setAmount] = useState('');
  const [qrUploaded, setQrUploaded] = useState(false);
  const [transactions] = useState<Transaction[]>([
    { id: '1', amount: 1000, date: '2025-10-25', status: 'completed' },
    { id: '2', amount: 500, date: '2025-10-26', status: 'pending' },
  ]);
  const { toast } = useToast();

  const handleAmountSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: '❌ Ошибка',
        description: 'Пожалуйста, введите корректную сумму',
        variant: 'destructive',
      });
      return;
    }
    setTopupStep('qr');
  };

  const handleQrUpload = () => {
    setQrUploaded(true);
    setTimeout(() => {
      setTopupStep('details');
      toast({
        title: '✅ QR-код принят!',
        description: 'Вот реквизиты для оплаты',
      });
    }, 500);
  };

  const renderMainView = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold">💳 Alipay Bot</h1>
          <p className="text-muted-foreground">Быстрое и удобное пополнение</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => {
              setView('topup');
              setTopupStep('amount');
              setAmount('');
              setQrUploaded(false);
            }}
            className="w-full h-14 text-lg bg-card hover:bg-card/80 text-foreground border border-border shadow-lg"
            variant="outline"
          >
            <span className="mr-2">📱</span> Пополнить Алипей
          </Button>

          <Button
            onClick={() => setView('history')}
            className="w-full h-14 text-lg bg-card hover:bg-card/80 text-foreground border border-border shadow-lg"
            variant="outline"
          >
            <span className="mr-2">📊</span> Мои Пополнения
          </Button>

          <Button
            onClick={() => setView('help')}
            className="w-full h-14 text-lg bg-card hover:bg-card/80 text-foreground border border-border shadow-lg"
            variant="outline"
          >
            <span className="mr-2">🆘</span> Помощь
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTopupView = () => (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background via-background to-accent/10">
      <div className="max-w-md mx-auto pt-8">
        <Button
          onClick={() => setView('main')}
          variant="ghost"
          className="mb-6"
        >
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>

        <Card className="p-6 bg-card border-border shadow-xl">
          {topupStep === 'amount' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">💰 Введите сумму</h2>
                <p className="text-muted-foreground">
                  Укажите сумму пополнения в юанях
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Сумма (¥)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>

                <Button
                  onClick={handleAmountSubmit}
                  className="w-full h-12 text-lg"
                >
                  Продолжить
                  <Icon name="ArrowRight" className="ml-2" size={20} />
                </Button>
              </div>
            </div>
          )}

          {topupStep === 'qr' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">📸 Отправьте QR-код</h2>
                <p className="text-muted-foreground">
                  Загрузите ваш QR-код Alipay
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Нажмите для загрузки QR-кода
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="qr-upload"
                    onChange={handleQrUpload}
                  />
                  <Button asChild>
                    <label htmlFor="qr-upload" className="cursor-pointer">
                      Выбрать файл
                    </label>
                  </Button>
                </div>

                {qrUploaded && (
                  <div className="text-center text-sm text-green-500">
                    ✅ QR-код загружен
                  </div>
                )}
              </div>
            </div>
          )}

          {topupStep === 'details' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">✅ Реквизиты для оплаты</h2>
                <p className="text-muted-foreground">
                  Отправьте {amount} ¥ по указанным реквизитам
                </p>
              </div>

              <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Получатель
                  </p>
                  <p className="text-lg font-mono">Zhang Wei</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Номер счета
                  </p>
                  <p className="text-lg font-mono">+86 138 0013 8000</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Сумма
                  </p>
                  <p className="text-2xl font-bold text-primary">¥ {amount}</p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-yellow-200">
                  ⚠️ После оплаты средства поступят на ваш счет в течение 5-10 минут
                </p>
              </div>

              <Button
                onClick={() => setView('main')}
                className="w-full h-12"
              >
                Готово
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  const renderHistoryView = () => (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background via-background to-accent/10">
      <div className="max-w-md mx-auto pt-8">
        <Button
          onClick={() => setView('main')}
          variant="ghost"
          className="mb-6"
        >
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">📊 История операций</h2>
            <p className="text-muted-foreground">Все ваши пополнения</p>
          </div>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <Card key={tx.id} className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">¥ {tx.amount}</p>
                    <p className="text-sm text-muted-foreground">{tx.date}</p>
                  </div>
                  <div>
                    {tx.status === 'completed' && (
                      <span className="text-green-500 text-sm">✅ Завершено</span>
                    )}
                    {tx.status === 'pending' && (
                      <span className="text-yellow-500 text-sm">⏳ В обработке</span>
                    )}
                    {tx.status === 'failed' && (
                      <span className="text-red-500 text-sm">❌ Ошибка</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelpView = () => (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background via-background to-accent/10">
      <div className="max-w-md mx-auto pt-8">
        <Button
          onClick={() => setView('main')}
          variant="ghost"
          className="mb-6"
        >
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>

        <Card className="p-6 bg-card border-border shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">🆘 Помощь</h2>
            <p className="text-muted-foreground">Как пользоваться ботом</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span>1️⃣</span> Как пополнить?
              </h3>
              <p className="text-sm text-muted-foreground pl-8">
                Нажмите "Пополнить Алипей", введите сумму, загрузите QR-код и получите реквизиты
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span>2️⃣</span> Сколько ждать?
              </h3>
              <p className="text-sm text-muted-foreground pl-8">
                Обычно деньги приходят в течение 5-10 минут после оплаты
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span>3️⃣</span> Возникли проблемы?
              </h3>
              <p className="text-sm text-muted-foreground pl-8">
                Свяжитесь с нами: support@alipaybot.com
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full"
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

  return (
    <>
      {view === 'main' && renderMainView()}
      {view === 'topup' && renderTopupView()}
      {view === 'history' && renderHistoryView()}
      {view === 'help' && renderHelpView()}
    </>
  );
};

export default Index;

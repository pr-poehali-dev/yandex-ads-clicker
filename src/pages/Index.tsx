import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AdminPanel from '@/components/AdminPanel';

type View = 'main' | 'topup' | 'history' | 'help' | 'admin';
type TopupStep = 'amount' | 'qr' | 'details';
type Currency = 'CNY' | 'RUB';

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

const CNY_TO_RUB_RATE = 11.40;
const API_BASE_URL = 'https://functions.poehali.dev';
const TRANSACTIONS_URL = `${API_BASE_URL}/414252e7-8c91-4292-98d5-f6fd21aab3f4`;

const Index = () => {
  const [view, setView] = useState<View>('main');
  const [topupStep, setTopupStep] = useState<TopupStep>('amount');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('CNY');
  const [qrUploaded, setQrUploaded] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (view === 'history') {
      fetchTransactions();
    }
  }, [view]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(TRANSACTIONS_URL);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

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

  const handleQrUpload = async () => {
    setQrUploaded(true);
    
    try {
      const response = await fetch(TRANSACTIONS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: currency,
        }),
      });

      const transaction = await response.json();
      setCurrentTransaction(transaction);

      setTimeout(() => {
        setTopupStep('details');
        toast({
          title: '✅ QR-код принят!',
          description: 'Вот реквизиты для оплаты',
        });
      }, 500);
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось создать заявку',
        variant: 'destructive',
      });
    }
  };

  const getDisplayAmount = () => {
    const amountValue = parseFloat(amount);
    if (currency === 'CNY') {
      return `¥ ${amountValue}`;
    }
    return `₽ ${amountValue} (¥ ${(amountValue / CNY_TO_RUB_RATE).toFixed(2)})`;
  };

  const renderMainView = () => (
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
            onClick={() => {
              setView('topup');
              setTopupStep('amount');
              setAmount('');
              setCurrency('CNY');
              setQrUploaded(false);
              setCurrentTransaction(null);
            }}
            className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300 text-white border-0"
          >
            <Icon name="Wallet" className="mr-3" size={24} />
            Пополнить кошелёк
          </Button>

          <Button
            onClick={() => setView('history')}
            className="w-full h-14 text-base font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 shadow-sm"
            variant="outline"
          >
            <Icon name="Clock" className="mr-2" size={20} />
            История операций
          </Button>

          <Button
            onClick={() => setView('help')}
            className="w-full h-14 text-base font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 shadow-sm"
            variant="outline"
          >
            <Icon name="HelpCircle" className="mr-2" size={20} />
            Помощь
          </Button>

          <Button
            onClick={() => setView('admin')}
            className="w-full h-10 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 mt-8"
            variant="outline"
          >
            <Icon name="Settings" className="mr-2" size={16} />
            Админ-панель
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTopupView = () => (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <div className="max-w-md mx-auto pt-8">
        <Button
          onClick={() => setView('main')}
          variant="ghost"
          className="mb-6"
        >
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>

        <Card className="p-8 bg-white border-0 shadow-2xl rounded-2xl">
          {topupStep === 'amount' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Icon name="DollarSign" className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Введите сумму</h2>
                <p className="text-gray-600">
                  Укажите сумму пополнения
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">Валюта</Label>
                  <RadioGroup value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                    <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-blue-50 transition-all cursor-pointer">
                      <RadioGroupItem value="CNY" id="cny" />
                      <Label htmlFor="cny" className="flex-1 cursor-pointer">
                        <div className="font-semibold text-gray-800">¥ Юани (CNY)</div>
                        <div className="text-sm text-gray-500">Китайский юань</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-blue-50 transition-all cursor-pointer">
                      <RadioGroupItem value="RUB" id="rub" />
                      <Label htmlFor="rub" className="flex-1 cursor-pointer">
                        <div className="font-semibold text-gray-800">₽ Рубли (RUB)</div>
                        <div className="text-sm text-gray-500">Курс: 1¥ = 11.40₽</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-700 font-medium">Сумма ({currency === 'CNY' ? '¥' : '₽'})</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder={currency === 'CNY' ? '1000' : '11400'}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-xl h-14 border-2 border-gray-200 focus:border-primary rounded-xl"
                  />
                  {currency === 'RUB' && amount && parseFloat(amount) > 0 && (
                    <p className="text-sm text-gray-500">
                      ≈ ¥ {(parseFloat(amount) / CNY_TO_RUB_RATE).toFixed(2)}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleAmountSubmit}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
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
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Icon name="QrCode" className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Отправьте QR-код</h2>
                <p className="text-gray-600">
                  Загрузите ваш QR-код Alipay
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-primary hover:bg-blue-50 transition-all">
                  <Icon name="Upload" size={48} className="mx-auto mb-4 text-gray-400" />
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

          {topupStep === 'details' && currentTransaction && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">✅ Реквизиты для оплаты</h2>
                <p className="text-muted-foreground">
                  Отправьте {getDisplayAmount()} по указанным реквизитам
                </p>
              </div>

              <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                {currentTransaction.payment_details && (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Получатель
                      </p>
                      <p className="text-lg font-mono">{currentTransaction.payment_details.recipient_name}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Номер счета
                      </p>
                      <p className="text-lg font-mono">{currentTransaction.payment_details.account_number}</p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Сумма к оплате
                  </p>
                  <p className="text-2xl font-bold text-primary">{getDisplayAmount()}</p>
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
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-sky-50">
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
            {transactions.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                Пока нет транзакций
              </Card>
            ) : (
              transactions.map((tx) => (
                <Card key={tx.id} className="p-4 bg-card border-border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {tx.currency === 'CNY' ? '¥' : '₽'} {tx.amount}
                        {tx.currency === 'RUB' && (
                          <span className="text-sm text-muted-foreground ml-2">
                            (¥ {tx.amount_cny})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.date).toLocaleString('ru-RU')}
                      </p>
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelpView = () => (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <div className="max-w-md mx-auto pt-8">
        <Button
          onClick={() => setView('main')}
          variant="ghost"
          className="mb-6"
        >
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>

        <Card className="p-8 bg-white border-0 shadow-2xl rounded-2xl space-y-6">
          <div className="text-center space-y-3">
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

  return (
    <>
      {view === 'main' && renderMainView()}
      {view === 'topup' && renderTopupView()}
      {view === 'history' && renderHistoryView()}
      {view === 'help' && renderHelpView()}
      {view === 'admin' && <AdminPanel onBack={() => setView('main')} />}
    </>
  );
};

export default Index;
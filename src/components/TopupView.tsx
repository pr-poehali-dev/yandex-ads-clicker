import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type TopupStep = 'amount' | 'qr' | 'details' | 'payment-proof' | 'waiting';
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

interface TopupViewProps {
  topupStep: TopupStep;
  amount: string;
  currency: Currency;
  qrUploaded: boolean;
  paymentProofUploaded: boolean;
  currentTransaction: Transaction | null;
  onBack: () => void;
  onAmountChange: (value: string) => void;
  onCurrencyChange: (value: Currency) => void;
  onAmountSubmit: () => void;
  onQrUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPaymentProofUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onComplete: () => void;
  getDisplayAmount: () => string;
  waitingTime?: number;
}

const CNY_TO_RUB_RATE = 11.40;

const TopupView = ({
  topupStep,
  amount,
  currency,
  qrUploaded,
  paymentProofUploaded,
  currentTransaction,
  onBack,
  onAmountChange,
  onCurrencyChange,
  onAmountSubmit,
  onQrUpload,
  onPaymentProofUpload,
  onComplete,
  getDisplayAmount,
  waitingTime = 0,
}: TopupViewProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (topupStep === 'waiting') {
      const interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedSeconds(0);
    }
  }, [topupStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-500 via-blue-400 to-sky-400">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      <div className="max-w-md mx-auto pt-8 relative z-10">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 text-white hover:bg-white/20"
        >
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>

        <Card className="p-8 bg-white/95 backdrop-blur border-0 shadow-2xl rounded-3xl">
          {topupStep === 'amount' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 4C12.96 4 4 12.96 4 24s8.96 20 20 20 20-8.96 20-20S35.04 4 24 4zm0 36c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z" fill="white"/>
                    <path d="M28.8 18.4h-9.6c-1.32 0-2.4 1.08-2.4 2.4v6.4c0 1.32 1.08 2.4 2.4 2.4h9.6c1.32 0 2.4-1.08 2.4-2.4v-6.4c0-1.32-1.08-2.4-2.4-2.4z" fill="white"/>
                    <path d="M18 22h12M21 18v12M27 18v12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Введите сумму</h2>
                <p className="text-gray-600">
                  Укажите сумму пополнения
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-gray-700 font-medium">
                    Сумма в рублях
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => onAmountChange(e.target.value)}
                      className="pl-8 h-14 text-lg border-2 border-gray-200 focus:border-primary rounded-xl"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                      ₽
                    </span>
                  </div>
                  {amount && parseFloat(amount) > 0 && (
                    <p className="text-sm text-muted-foreground">
                      ≈ ¥ {(parseFloat(amount) / 11.45).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={onAmountSubmit}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white font-semibold"
              >
                Продолжить
                <Icon name="ArrowRight" className="ml-2" size={20} />
              </Button>
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

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mb-4">
                    <Icon name="HelpCircle" className="mr-2" size={20} />
                    Где найти QR-код?
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Инструкция: Где найти QR-код Alipay</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <img 
                      src="https://cdn.poehali.dev/files/04d3d49b-b9ed-4796-85af-50d93ee939a7.png" 
                      alt="Инструкция Alipay" 
                      className="w-full rounded-lg border"
                    />
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <strong>1.</strong> Откройте приложение Alipay<br/>
                        <strong>2.</strong> Нажмите "Оплатить и получить"<br/>
                        <strong>3.</strong> Выберите "Приём платежей"<br/>
                        <strong>4.</strong> Сделайте скриншот QR-кода
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

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
                    onChange={onQrUpload}
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

              {currentTransaction.payment_details && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-6 rounded-xl space-y-4">
                    <div>
                      <Label className="text-sm text-gray-600">Получатель</Label>
                      <p className="text-lg font-semibold text-gray-800 mt-1">
                        {currentTransaction.payment_details.recipient_name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Номер счёта</Label>
                      <p className="text-lg font-semibold text-gray-800 font-mono mt-1">
                        {currentTransaction.payment_details.account_number}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Сумма</Label>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {getDisplayAmount()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Важно:</strong> Переведите точную сумму {getDisplayAmount()}. После перевода средства поступят на ваш счёт в течение 5-10 минут.
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={() => document.getElementById('payment-proof-upload')?.click()}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white font-semibold"
              >
                <Icon name="CheckCircle" className="mr-2" size={20} />
                Я оплатил
              </Button>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                id="payment-proof-upload"
                onChange={onPaymentProofUpload}
              />
            </div>
          )}

          {topupStep === 'payment-proof' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Icon name="Camera" className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Загрузите скриншот оплаты</h2>
                <p className="text-gray-600">
                  Подтвердите перевод средств
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-primary hover:bg-blue-50 transition-all">
                  <Icon name="Upload" size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Нажмите для загрузки скриншота
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="proof-upload"
                    onChange={onPaymentProofUpload}
                  />
                  <Button asChild>
                    <label htmlFor="proof-upload" className="cursor-pointer">
                      Выбрать файл
                    </label>
                  </Button>
                </div>

                {paymentProofUploaded && (
                  <div className="text-center text-sm text-green-500">
                    ✅ Скриншот загружен
                  </div>
                )}
              </div>
            </div>
          )}

          {topupStep === 'waiting' && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                  <Icon name="Clock" className="text-white" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Ожидаем подтверждения</h2>
                <p className="text-gray-600">
                  Ваш платёж проверяется администратором
                </p>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-4">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {formatTime(elapsedSeconds)}
                  </div>
                  <p className="text-sm text-gray-600">Время ожидания</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>💡 Обычно проверка занимает 1-3 минуты</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TopupView;
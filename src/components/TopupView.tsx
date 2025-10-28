import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

interface TopupViewProps {
  topupStep: TopupStep;
  amount: string;
  currency: Currency;
  qrUploaded: boolean;
  currentTransaction: Transaction | null;
  onBack: () => void;
  onAmountChange: (value: string) => void;
  onCurrencyChange: (value: Currency) => void;
  onAmountSubmit: () => void;
  onQrUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onComplete: () => void;
  getDisplayAmount: () => string;
}

const CNY_TO_RUB_RATE = 11.40;

const TopupView = ({
  topupStep,
  amount,
  currency,
  qrUploaded,
  currentTransaction,
  onBack,
  onAmountChange,
  onCurrencyChange,
  onAmountSubmit,
  onQrUpload,
  onComplete,
  getDisplayAmount,
}: TopupViewProps) => {
  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <div className="max-w-md mx-auto pt-8">
        <Button
          onClick={onBack}
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
                onClick={onComplete}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white font-semibold"
              >
                <Icon name="CheckCircle" className="mr-2" size={20} />
                Готово
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TopupView;
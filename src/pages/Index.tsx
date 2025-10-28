import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminPanel from '@/components/AdminPanel';
import MainView from '@/components/MainView';
import TopupView from '@/components/TopupView';
import HistoryView from '@/components/HistoryView';
import HelpView from '@/components/HelpView';

type View = 'main' | 'topup' | 'history' | 'help' | 'admin';
type TopupStep = 'amount' | 'qr' | 'details' | 'payment-proof';
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
  const [paymentProofUploaded, setPaymentProofUploaded] = useState(false);
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

  const handleQrUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setQrUploaded(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        const telegramUrl = 'https://functions.poehali.dev/1176ffc9-bd7b-4a55-9c07-6c45775764a9';
        await fetch(telegramUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
            amount: amount,
            currency: currency,
          }),
        });

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
      };
      
      reader.readAsDataURL(file);
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

  const handleTopupStart = () => {
    setView('topup');
    setTopupStep('amount');
    setAmount('');
    setCurrency('CNY');
    setQrUploaded(false);
    setCurrentTransaction(null);
  };

  const handlePaymentProofUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPaymentProofUploaded(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        const telegramUrl = 'https://functions.poehali.dev/1176ffc9-bd7b-4a55-9c07-6c45775764a9';
        await fetch(telegramUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
            amount: amount,
            currency: currency,
            type: 'payment_proof',
            transaction_id: currentTransaction?.id,
          }),
        });

        if (currentTransaction) {
          await fetch(`${TRANSACTIONS_URL}/${currentTransaction.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'completed',
            }),
          });
        }

        setTimeout(() => {
          toast({
            title: '✅ Скриншот принят!',
            description: 'Ваша заявка обрабатывается',
          });
          handleTopupComplete();
        }, 500);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload payment proof:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось загрузить скриншот',
        variant: 'destructive',
      });
    }
  };

  const handleTopupComplete = () => {
    setView('main');
    setTopupStep('amount');
    setAmount('');
    setCurrency('CNY');
    setQrUploaded(false);
    setPaymentProofUploaded(false);
    setCurrentTransaction(null);
  };

  if (view === 'admin') {
    return <AdminPanel onBack={() => setView('main')} />;
  }

  if (view === 'topup') {
    return (
      <TopupView
        topupStep={topupStep}
        amount={amount}
        currency={currency}
        qrUploaded={qrUploaded}
        currentTransaction={currentTransaction}
        onBack={() => setView('main')}
        onAmountChange={setAmount}
        onCurrencyChange={setCurrency}
        onAmountSubmit={handleAmountSubmit}
        onQrUpload={handleQrUpload}
        onPaymentProofUpload={handlePaymentProofUpload}
        paymentProofUploaded={paymentProofUploaded}
        onComplete={handleTopupComplete}
        getDisplayAmount={getDisplayAmount}
      />
    );
  }

  if (view === 'history') {
    return (
      <HistoryView
        transactions={transactions}
        onBack={() => setView('main')}
      />
    );
  }

  if (view === 'help') {
    return <HelpView onBack={() => setView('main')} />;
  }

  return (
    <MainView
      onNavigate={setView}
      onTopupStart={handleTopupStart}
    />
  );
};

export default Index;
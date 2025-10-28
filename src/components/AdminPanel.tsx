import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

interface PaymentDetail {
  id: number;
  recipient_name: string;
  account_number: string;
  currency: string;
  is_active: boolean;
  created_at: string;
}

const API_BASE_URL = 'https://functions.poehali.dev';
const PAYMENT_DETAILS_URL = `${API_BASE_URL}/a43eaa82-a100-498f-861b-df3e74b3c911`;
const TRANSACTIONS_URL = `${API_BASE_URL}/414252e7-8c91-4292-98d5-f6fd21aab3f4`;

interface Transaction {
  id: number;
  amount: number;
  currency: string;
  amount_cny: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  qr_code_url?: string;
  payment_proof_url?: string;
}

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [view, setView] = useState<'payment-details' | 'transactions'>('payment-details');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    recipient_name: '',
    account_number: '',
    currency: 'CNY',
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (view === 'payment-details') {
      fetchPaymentDetails();
    } else {
      fetchTransactions();
    }
  }, [view]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(PAYMENT_DETAILS_URL);
      const data = await response.json();
      setPaymentDetails(data);
    } catch (error) {
      console.error('Failed to fetch payment details:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(TRANSACTIONS_URL);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipient_name || !formData.account_number) {
      toast({
        title: '❌ Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingId) {
        await fetch(PAYMENT_DETAILS_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingId }),
        });
        toast({
          title: '✅ Успешно',
          description: 'Реквизиты обновлены',
        });
      } else {
        await fetch(PAYMENT_DETAILS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        toast({
          title: '✅ Успешно',
          description: 'Реквизиты добавлены',
        });
      }

      setFormData({ recipient_name: '', account_number: '', currency: 'CNY', is_active: true });
      setEditingId(null);
      fetchPaymentDetails();
    } catch (error) {
      console.error('Failed to save payment detail:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось сохранить',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (detail: PaymentDetail) => {
    setFormData({
      recipient_name: detail.recipient_name,
      account_number: detail.account_number,
      currency: detail.currency,
      is_active: detail.is_active,
    });
    setEditingId(detail.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить реквизит?')) return;

    try {
      await fetch(`${PAYMENT_DETAILS_URL}?id=${id}`, {
        method: 'DELETE',
      });
      toast({
        title: '✅ Успешно',
        description: 'Реквизит удален',
      });
      fetchPaymentDetails();
    } catch (error) {
      console.error('Failed to delete payment detail:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось удалить',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <div className="max-w-4xl mx-auto pt-8">
        <Button onClick={onBack} variant="ghost" className="mb-6">
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">⚙️ Админ-панель</h2>
            <p className="text-muted-foreground">Управление системой</p>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={() => setView('payment-details')}
              variant={view === 'payment-details' ? 'default' : 'outline'}
              className="h-12"
            >
              <Icon name="CreditCard" className="mr-2" size={20} />
              Реквизиты
            </Button>
            <Button
              onClick={() => setView('transactions')}
              variant={view === 'transactions' ? 'default' : 'outline'}
              className="h-12"
            >
              <Icon name="FileText" className="mr-2" size={20} />
              Транзакции
            </Button>
          </div>

          {view === 'payment-details' && (
            <>
              <Card className="p-6 bg-card border-border">
                <h3 className="text-xl font-semibold mb-4">
                  {editingId ? 'Редактировать реквизит' : 'Добавить реквизит'}
                </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">Получатель</Label>
                  <Input
                    id="recipient_name"
                    value={formData.recipient_name}
                    onChange={(e) =>
                      setFormData({ ...formData, recipient_name: e.target.value })
                    }
                    placeholder="Zhang Wei"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_number">Номер счета</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) =>
                      setFormData({ ...formData, account_number: e.target.value })
                    }
                    placeholder="+86 138 0013 8000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Валюта</Label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="CNY">CNY (Юани)</option>
                    <option value="RUB">RUB (Рубли)</option>
                  </select>
                </div>

                <div className="space-y-2 flex items-end">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active">Активен</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Сохранить' : 'Добавить'}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        recipient_name: '',
                        account_number: '',
                        currency: 'CNY',
                        is_active: true,
                      });
                    }}
                  >
                    Отмена
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Список реквизитов</h3>
            {paymentDetails.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                Реквизиты не найдены
              </Card>
            ) : (
              paymentDetails.map((detail) => (
                <Card key={detail.id} className="p-4 bg-card border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{detail.recipient_name}</h4>
                        {detail.is_active ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                            Активен
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-500">
                            Неактивен
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground font-mono">{detail.account_number}</p>
                      <p className="text-sm text-muted-foreground">
                        Валюта: {detail.currency} • Создано:{' '}
                        {new Date(detail.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(detail)}
                      >
                        <Icon name="Pencil" size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(detail.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
            </>
          )}

          {view === 'transactions' && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Список транзакций</h3>
              {transactions.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground">
                  Транзакции не найдены
                </Card>
              ) : (
                transactions.map((transaction) => (
                  <Card key={transaction.id} className="p-4 bg-card border-border">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-lg">
                            ₽ {transaction.amount} (¥ {transaction.amount_cny})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleString('ru-RU')}
                          </p>
                          <p className="text-sm">
                            Статус: <span className={
                              transaction.status === 'completed' ? 'text-green-600' :
                              transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                            }>
                              {transaction.status === 'completed' ? 'Завершено' :
                               transaction.status === 'pending' ? 'В обработке' : 'Отклонено'}
                            </span>
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          ID: {transaction.id}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {transaction.qr_code_url && (
                          <div className="border rounded-lg p-2">
                            <p className="text-xs text-muted-foreground mb-2">QR-код пользователя:</p>
                            <a 
                              href={transaction.qr_code_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm flex items-center gap-1"
                            >
                              <Icon name="Image" size={16} />
                              Посмотреть
                            </a>
                          </div>
                        )}
                        
                        {transaction.payment_proof_url && (
                          <div className="border rounded-lg p-2">
                            <p className="text-xs text-muted-foreground mb-2">Скриншот оплаты:</p>
                            <a 
                              href={transaction.payment_proof_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline text-sm flex items-center gap-1"
                            >
                              <Icon name="CheckCircle" size={16} />
                              Посмотреть
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
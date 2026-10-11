import React, { useState } from 'react';
import { View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../theme/useTheme';
import { AnnualBonus } from '../types/budget';
import { isDecember, readableDate } from '../utils/dates';
import { money, moneyInput, parseMoney } from '../utils/money';
import { upcomingPayments } from '../utils/payments';
import { Icon } from './Icon';
import { AppText, Button, Card, Field } from './ui';

export function AnnualBonusCard({ currentDay }: { currentDay: string }) {
  const { state, dispatch } = useBudget();
  const year = Number(currentDay.slice(0, 4));
  const entry = state.annualBonuses.find(bonus => bonus.year === year);
  // La regla depende del mes actual del dispositivo, no del mes que se hojea.
  if (!isDecember(currentDay)) return <Card style={{ gap: 10 }}>
    <AppText variant="heading">Aguinaldo</AppText>
    <AppText variant="muted">Este apartado se habilita en diciembre para registrar el aguinaldo del año.</AppText>
  </Card>;

  const scheduledDecember = upcomingPayments(state.paymentSchedule, currentDay).find(payment => isDecember(payment.paymentDate) && payment.paymentDate.startsWith(`${year}-`));
  // Editar el monto no mueve un aguinaldo anterior a la siguiente quincena.
  const paymentDate = entry?.date ?? scheduledDecember?.paymentDate ?? currentDay;
  return <BonusForm key={year} year={year} entry={entry} paymentDate={paymentDate} onSave={bonus => dispatch({ type: 'SET_ANNUAL_BONUS', bonus })} />;
}

function BonusForm({ year, entry, paymentDate, onSave }: {
  year: number; entry?: AnnualBonus; paymentDate: string; onSave: (bonus: AnnualBonus) => void;
}) {
  const { colors } = useTheme();
  const [amount, setAmount] = useState(entry ? moneyInput(entry.amountCents) : '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [bonusDate, setBonusDate] = useState(paymentDate);

  function save() {
    const amountCents = parseMoney(amount);
    if (amountCents === null) return setError('Ingresa un monto válido, con máximo dos decimales.');
    if (!isDecember(bonusDate) || Number(bonusDate.slice(0, 4)) !== year) return setError('La fecha del aguinaldo debe ser válida y pertenecer a diciembre de este año.');
    onSave({ year, date: bonusDate, amountCents });
    setError(''); setSaved(true);
  }

  return <Card style={{ gap: 17 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Icon name="wallet" color={colors.primary} /><AppText variant="heading">Aguinaldo {year}</AppText></View>
    <AppText variant="muted">Introduce el monto que recibirás como ingreso adicional en diciembre.</AppText>
    <Field label="Aguinaldo (USD)" placeholder="0.00" value={amount} keyboardType="decimal-pad" maxLength={9}
      onChangeText={value => { setAmount(value); setSaved(false); setError(''); }} />
    <Field label="Fecha del aguinaldo (AAAA-MM-DD)" value={bonusDate} maxLength={10} placeholder={`${year}-12-15`}
      onChangeText={value => { setBonusDate(value); setSaved(false); setError(''); }} />
    <View style={{ backgroundColor: colors.surfaceAlt, padding: 13, borderRadius: 13, gap: 4 }}>
      <AppText style={{ fontSize: 12, fontWeight: '600' }}>Fecha del aguinaldo: {isDecember(bonusDate) ? readableDate(bonusDate) : 'Revisa la fecha'}</AppText>
      <AppText variant="muted" style={{ fontSize: 11 }}>Se sumará al saldo de esa quincena. Puedes usar una fecha de diciembre distinta a tus pagos habituales.</AppText>
    </View>
    <Button title="Guardar aguinaldo" icon="check" onPress={save} />
    {!!error && <AppText accessibilityRole="alert" style={{ color: colors.danger }}>{error}</AppText>}
    {saved && entry?.date === bonusDate && <AppText accessibilityRole="alert" style={{ color: colors.success, fontSize: 13 }}>Aguinaldo guardado: {money(entry?.amountCents ?? 0)}.</AppText>}
    <AppText variant="muted" style={{ fontSize: 11 }}>Volver a guardar actualiza el aguinaldo de este año. Usa 0 para retirarlo del saldo.</AppText>
  </Card>;
}

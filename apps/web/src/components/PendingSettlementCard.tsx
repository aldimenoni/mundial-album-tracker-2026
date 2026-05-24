import type { PendingSettlementDto } from "@mundial-album/shared";
import { ExchangeOptionList, type ExchangeSelection } from "./ExchangeOptionList";

type PendingSettlementCardProps = {
  settlement: PendingSettlementDto;
  isFinalizing?: boolean;
  finalizingOptionKey?: string | null;
  onFinalizeOne?: (settlement: PendingSettlementDto, selection: ExchangeSelection, optionKey: string) => void;
};

export function PendingSettlementCard({
  settlement,
  isFinalizing = false,
  finalizingOptionKey = null,
  onFinalizeOne
}: PendingSettlementCardProps) {
  return (
    <section className="pending-settlement-card">
      <div className="pending-settlement-header">
        <h3>@{settlement.otherUser.name}</h3>
        <span className="exchange-type-badge exchange-type-partial">Saldo pendiente</span>
        <p className="exchange-totals-line">
          Te deben {settlement.owedToMe} · Debés {settlement.owedByMe}
        </p>
      </div>

      <p className="pending-settlement-message">{settlement.message}</p>

      <ExchangeOptionList
        options={settlement.options}
        isBusy={isFinalizing}
        busyOptionKey={finalizingOptionKey}
        {...(onFinalizeOne
          ? {
              onConfirmOne: (selection, optionKey) =>
                onFinalizeOne(settlement, selection, optionKey)
            }
          : {})}
      />
    </section>
  );
}

import type { PendingSettlementDto } from "@mundial-album/shared";
import { AppCard } from "./ui/AppCard";
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
    <AppCard className="p-0">
      <div className="grid gap-2 border-b border-white/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-black text-white">@{settlement.otherUser.name}</h3>
          <span className="inline-flex shrink-0 rounded-full bg-indigo-500/20 px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-indigo-100">
            Saldo pendiente
          </span>
        </div>
        <p className="text-sm font-extrabold text-white/75">
          Te deben {settlement.owedToMe} · Debés {settlement.owedByMe}
        </p>
      </div>

      <div className="grid gap-3 p-3">
        <p className="text-sm font-semibold leading-relaxed text-white/65">{settlement.message}</p>

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
      </div>
    </AppCard>
  );
}

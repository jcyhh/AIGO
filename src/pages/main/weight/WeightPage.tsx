import tokenIcon from '@/assets/common/usdt.png'
import bg from '@/assets/weight/bg.png'

import './WeightPage.scss'

type WeightRecord = {
    id: number
    remark: string
    date: string
    amount: string
}

const WEIGHT_RECORD_LIST: WeightRecord[] = [
    {
        id: 1,
        remark: '备注备注',
        date: '2025.08.26 12:24',
        amount: '888.76 Token',
    },
    {
        id: 2,
        remark: '备注备注',
        date: '2025.08.26 12:24',
        amount: '888.76 Token',
    },
    {
        id: 3,
        remark: '备注备注',
        date: '2025.08.26 12:24',
        amount: '888.76 TGC',
    },
    {
        id: 4,
        remark: '备注备注',
        date: '2025.08.26 12:24',
        amount: '888.76 TGC',
    },
    {
        id: 5,
        remark: '备注备注',
        date: '2025.08.26 12:24',
        amount: '888.76 TGC',
    },
    {
        id: 6,
        remark: '备注备注',
        date: '2025.08.26 12:24',
        amount: '888.76 TGC',
    },
]

export function WeightPage() {
    return (
        <section className="weight-page" data-page="weight">
            <img src={bg} className="weight-page__bg" />

            <div className="weight-page__content rel pt-108 pr-30 pb-60 pl-30">
                <section className="weight-page__summary tc">
                    <div className="weight-page__token-pill inline-flex items-center">
                        <img src={tokenIcon} className="img-48 flex-none" />
                        <span className="size-28 bold-6 ml-8">Token</span>
                    </div>

                    <div className="size-56 bold-7 mt-20">126,567.086748</div>
                    <div className="size-24 opc-5 mt-20">权重金额</div>
                    <button
                        type="button"
                        className="weight-page__extract-button size-24 bold-7 mt-30"
                    >
                        提取
                    </button>
                </section>

                <div className="weight-page__section-title flex-center mt-102">
                    <div className="weight-page__section-title-line weight-page__section-title-line--left" />
                    <div className="size-32 ml-30 mr-30">流水明细</div>
                    <div className="weight-page__section-title-line weight-page__section-title-line--right" />
                </div>

                <div className="weight-page__record-list mt-40">
                    {WEIGHT_RECORD_LIST.map((record) => (
                        <article
                            className="weight-page__record-card flex-between items-center mb-20"
                            key={record.id}
                        >
                            <div>
                                <div className="size-28 bold-5">{record.remark}</div>
                                <div className="size-24 opc-5 mt-18">{record.date}</div>
                            </div>
                            <div className="tr">
                                <div className="size-28 bold-5">{record.amount}</div>
                                <div className="size-24 opc-5 mt-18">金额</div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

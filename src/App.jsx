import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Edit2, Trash2, Check, X, Moon, Sun, AlertCircle } from 'lucide-react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num || 0)
}

const getDaysDiff = (dueDate) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24))
}

const initialDebts = [
  { name: 'Tokopedia Card (Bank BRI)', total: 106136842, minimum_payment: 5306842, due_date: '2026-11-01' },
  { name: 'GoPayLater', total: 3392863, minimum_payment: 3392863, due_date: '2026-11-01' },
  { name: 'Kartu Kredit Bank BRI (Hernando)', total: 29879776, minimum_payment: 1493989, due_date: '2026-11-03' },
  { name: 'Superbank', total: 9355930, minimum_payment: 9355930, due_date: '2026-11-03' },
  { name: 'SPinjam', total: 4776055, minimum_payment: 4776055, due_date: '2026-11-03' },
  { name: 'GoPay Pinjam', total: 4850056, minimum_payment: 4850056, due_date: '2026-11-03' },
  { name: 'TMRW Credit Card', total: 4805531, minimum_payment: 308124, due_date: '2026-11-05' },
  { name: 'UOB Privimiles Card', total: 36812993, minimum_payment: 2360400, due_date: '2026-11-05' },
  { name: 'BCA Paylater', total: 54814954, minimum_payment: 21224074, due_date: '2026-11-08' },
]

function App() {
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingDebt, setEditingDebt] = useState(null)
  const [form, setForm] = useState({
    name: '',
    total: '',
    minimum_payment: '',
    due_date: '',
  })

  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved) setDarkMode(JSON.parse(saved))
    fetchDebts()
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const fetchDebts = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('debts').select('*').order('due_date', { ascending: true })
    if (error) {
      console.error(error)
    } else {
      setDebts(data || [])
    }
    setLoading(false)
  }

  const sortedDebts = useMemo(() => {
    return [...debts].sort((a, b) => {
      if (a.is_paid !== b.is_paid) return a.is_paid ? 1 : -1
      const daysA = getDaysDiff(a.due_date)
      const daysB = getDaysDiff(b.due_date)
      return daysA - daysB
    })
  }, [debts])

  const totals = useMemo(() => {
    const unpaid = debts.filter(d => !d.is_paid)
    const totalDebt = unpaid.reduce((sum, d) => sum + Number(d.total || 0), 0)
    const totalMin = unpaid.reduce((sum, d) => {
      const min = Number(d.minimum_payment)
      return sum + (min > 0 ? min : Number(d.total || 0))
    }, 0)
    return { totalDebt, totalMin }
  }, [debts])

  const openAdd = () => {
    setEditingDebt(null)
    setForm({ name: '', total: '', minimum_payment: '', due_date: '' })
    setShowModal(true)
  }

  const openEdit = (debt) => {
    setEditingDebt(debt)
    setForm({
      name: debt.name,
      total: debt.total,
      minimum_payment: debt.minimum_payment || '',
      due_date: debt.due_date,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      total: Number(form.total),
      minimum_payment: form.minimum_payment ? Number(form.minimum_payment) : null,
      due_date: form.due_date,
    }

    if (editingDebt) {
      const { error } = await supabase.from('debts').update(payload).eq('id', editingDebt.id)
      if (!error) fetchDebts()
    } else {
      const { error } = await supabase.from('debts').insert(payload)
      if (!error) fetchDebts()
    }
    setShowModal(false)
  }

  const togglePaid = async (debt) => {
    const { error } = await supabase.from('debts').update({ is_paid: !debt.is_paid }).eq('id', debt.id)
    if (!error) fetchDebts()
  }

  const deleteDebt = async (id) => {
    if (!confirm('Hapus tagihan ini?')) return
    const { error } = await supabase.from('debts').delete().eq('id', id)
    if (!error) fetchDebts()
  }

  const seedData = async () => {
    if (!confirm('Masukkan data awal? Ini akan menambahkan 9 tagihan contoh.')) return
    const { error } = await supabase.from('debts').insert(initialDebts.map(d => ({ ...d, is_paid: false })))
    if (!error) fetchDebts()
  }

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-white dark:bg-black">
        <div className="border-4 border-current p-8 shadow-[6px_6px_0_0_#111] dark:shadow-[6px_6px_0_0_#fff] max-w-lg text-center">
          <AlertCircle className="mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-black uppercase mb-4">Supabase Belum Dikonfigurasi</h1>
          <p className="mb-4">Buat file <code className="font-bold">.env</code> dari <code>.env.example</code> dan isi VITE_SUPABASE_URL serta VITE_SUPABASE_ANON_KEY.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b-4 border-current pb-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Pengingat Hutang</h1>
          <p className="text-sm uppercase opacity-70">Dashboard Brutalist</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="border-4 border-current px-4 py-2 uppercase font-black shadow-[4px_4px_0_0_#111] dark:shadow-[4px_4px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={seedData}
            className="border-4 border-current px-4 py-2 uppercase font-black text-xs shadow-[4px_4px_0_0_#111] dark:shadow-[4px_4px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            Seed Data
          </button>
          <button
            onClick={openAdd}
            className="bg-neon text-black border-4 border-black px-5 py-2 uppercase font-black flex items-center gap-2 shadow-[6px_6px_0_0_#111] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all"
          >
            <Plus size={20} /> Tambah Tagihan
          </button>
        </div>
      </header>

      {/* Summary Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="border-4 border-danger bg-danger/10 p-6 shadow-[6px_6px_0_0_#111] dark:shadow-[6px_6px_0_0_#fff]">
          <p className="uppercase text-sm font-bold mb-2">Total Hutang Berjalan</p>
          <p className="text-3xl md:text-4xl font-black">{formatRupiah(totals.totalDebt)}</p>
        </div>
        <div className="border-4 border-neon bg-neon/20 p-6 shadow-[6px_6px_0_0_#111] dark:shadow-[6px_6px_0_0_#fff]">
          <p className="uppercase text-sm font-bold mb-2 text-black dark:text-white">Total Bayar Minimum</p>
          <p className="text-3xl md:text-4xl font-black text-black dark:text-neon">{formatRupiah(totals.totalMin)}</p>
        </div>
      </div>

      {/* Debt Cards */}
      {loading ? (
        <div className="text-center py-20 uppercase font-black text-xl">Memuat data...</div>
      ) : sortedDebts.length === 0 ? (
        <div className="text-center py-20 border-4 border-dashed border-current">
          <p className="uppercase font-black text-xl mb-4">Belum ada tagihan</p>
          <button onClick={seedData} className="bg-neon text-black border-4 border-black px-6 py-3 uppercase font-black">
            Masukkan Data Awal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDebts.map((debt) => {
            const days = getDaysDiff(debt.due_date)
            const isOverdue = days < 0 && !debt.is_paid
            const isPaid = debt.is_paid

            return (
              <div
                key={debt.id}
                className={`border-4 border-current p-5 relative transition-all ${
                  isPaid
                    ? 'opacity-50 grayscale line-through bg-gray-100 dark:bg-gray-900'
                    : 'bg-white dark:bg-black shadow-[6px_6px_0_0_#111] dark:shadow-[6px_6px_0_0_#fff]'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`font-black text-lg uppercase leading-tight pr-4 ${isPaid ? 'line-through' : ''}`}>
                    {debt.name}
                  </h3>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(debt)} className="p-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-2 border-current">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteDebt(debt.id)} className="p-1 hover:bg-danger hover:text-white border-2 border-current">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 mb-4 text-sm">
                  <p><span className="uppercase font-bold">Total:</span> {formatRupiah(debt.total)}</p>
                  <p><span className="uppercase font-bold">Min. Bayar:</span> {formatRupiah(debt.minimum_payment || debt.total)}</p>
                  <p><span className="uppercase font-bold">JT:</span> {new Date(debt.due_date).toLocaleDateString('id-ID')}</p>
                </div>

                {/* Days Badge */}
                {!isPaid && (
                  <div className={`inline-block px-3 py-1 text-xs font-black uppercase mb-4 ${
                    isOverdue
                      ? 'bg-danger text-white animate-blink border-2 border-danger'
                      : days <= 3
                      ? 'bg-neon text-black border-2 border-black'
                      : 'bg-green-500 text-black border-2 border-black'
                  }`}>
                    {isOverdue ? `Telat ${Math.abs(days)} Hari` : `Sisa ${days} Hari`}
                  </div>
                )}

                <button
                  onClick={() => togglePaid(debt)}
                  className={`w-full border-4 border-current py-2 uppercase font-black text-sm flex items-center justify-center gap-2 ${
                    isPaid
                      ? 'bg-gray-200 dark:bg-gray-800'
                      : 'bg-neon text-black hover:bg-black hover:text-neon'
                  }`}
                >
                  {isPaid ? <X size={16} /> : <Check size={16} />}
                  {isPaid ? 'Batal Lunas' : 'Lunasi'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-black border-4 border-current w-full max-w-md p-6 shadow-[8px_8px_0_0_#111] dark:shadow-[8px_8px_0_0_#fff]">
            <h2 className="text-2xl font-black uppercase mb-6">
              {editingDebt ? 'Edit Tagihan' : 'Tambah Tagihan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block uppercase text-xs font-black mb-1">Nama Tagihan</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-4 border-current px-3 py-2 bg-transparent uppercase font-bold"
                />
              </div>
              <div>
                <label className="block uppercase text-xs font-black mb-1">Total Hutang</label>
                <input
                  required
                  type="number"
                  value={form.total}
                  onChange={(e) => setForm({ ...form, total: e.target.value })}
                  className="w-full border-4 border-current px-3 py-2 bg-transparent font-bold"
                />
              </div>
              <div>
                <label className="block uppercase text-xs font-black mb-1">Minimum Payment (opsional)</label>
                <input
                  type="number"
                  value={form.minimum_payment}
                  onChange={(e) => setForm({ ...form, minimum_payment: e.target.value })}
                  className="w-full border-4 border-current px-3 py-2 bg-transparent font-bold"
                />
              </div>
              <div>
                <label className="block uppercase text-xs font-black mb-1">Tanggal Jatuh Tempo</label>
                <input
                  required
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full border-4 border-current px-3 py-2 bg-transparent font-bold"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-neon text-black border-4 border-black py-3 uppercase font-black"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border-4 border-current py-3 uppercase font-black"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

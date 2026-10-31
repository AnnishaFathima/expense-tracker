import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'http://127.0.0.1:8000'
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6']
const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Other']

const card = {
  background: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  marginBottom: '20px',
}
const input = {
  padding: '8px',
  marginRight: '8px',
  marginBottom: '8px',
  border: '1px solid #ccc',
  borderRadius: '6px',
}
const button = {
  padding: '8px 16px',
  background: '#4f46e5',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const [expenses, setExpenses] = useState([])
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const loadExpenses = async (t) => {
    const res = await fetch(`${API}/expenses`, {
      headers: { Authorization: `Bearer ${t}` },
    })
    if (res.status === 401) {
      logout()
      return
    }
    setExpenses(await res.json())
  }

  useEffect(() => {
    if (token) loadExpenses(token)
  }, [token])

  const handleAuth = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      if (mode === 'signup') {
        const res = await fetch(`${API}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setMessage(data.detail || 'Signup failed')
          return
        }
        setMessage('Account created! Please log in.')
        setMode('login')
      } else {
        const res = await fetch(`${API}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ username: email, password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setMessage(data.detail || 'Login failed')
          return
        }
        localStorage.setItem('token', data.access_token)
        setToken(data.access_token)
      }
    } catch {
      setMessage('Cannot reach the server. Is the backend running?')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    setExpenses([])
  }

  const addExpense = async (e) => {
    e.preventDefault()
    if (!amount) return
    await fetch(`${API}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: parseFloat(amount), category, note, date }),
    })
    setAmount('')
    setNote('')
    loadExpenses(token)
  }

  const deleteExpense = async (id) => {
    await fetch(`${API}/expenses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    loadExpenses(token)
  }

  const total = expenses.reduce((sum, x) => sum + x.amount, 0)

  const byCategory = Object.values(
    expenses.reduce((acc, x) => {
      acc[x.category] = acc[x.category] || { name: x.category, value: 0 }
      acc[x.category].value += x.amount
      return acc
    }, {})
  )

  if (!token) {
    return (
      <div style={{ maxWidth: '380px', margin: '80px auto' }}>
        <div style={card}>
          <h1 style={{ marginTop: 0 }}>Expense Tracker</h1>
          <h3>{mode === 'login' ? 'Log in' : 'Create account'}</h3>
          <form onSubmit={handleAuth}>
            <input
              style={{ ...input, width: '92%' }}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              style={{ ...input, width: '92%' }}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button style={button} type="submit">
              {mode === 'login' ? 'Log in' : 'Sign up'}
            </button>
          </form>
          {message && <p style={{ color: '#b45309' }}>{message}</p>}
          <p
            style={{ color: '#4f46e5', cursor: 'pointer' }}
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setMessage('')
            }}
          >
            {mode === 'login' ? 'No account? Sign up' : 'Have an account? Log in'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '700px', margin: '30px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Expense Tracker</h1>
        <button style={{ ...button, background: '#6b7280' }} onClick={logout}>
          Log out
        </button>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Add expense</h3>
        <form onSubmit={addExpense}>
          <input
            style={input}
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <select style={input} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            style={input}
            type="text"
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <input style={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <button style={button} type="submit">Add</button>
        </form>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Total spent: ₹{total.toFixed(2)}</h3>
        {byCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={90} label>
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p>No expenses yet. Add one above.</p>
        )}
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>All expenses</h3>
        {expenses.map((x) => (
          <div
            key={x.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <span>
              {x.date} · <strong>{x.category}</strong> · {x.note}
            </span>
            <span>
              ₹{x.amount}{' '}
              <button
                style={{ ...button, background: '#ef4444', padding: '4px 10px' }}
                onClick={() => deleteExpense(x.id)}
              >
                Delete
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
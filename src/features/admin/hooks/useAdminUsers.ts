import { useState, useEffect, useCallback } from 'react'
import { User } from '@/shared/types'
import { fetchAllUsers, updateUser, setUserActive, resetUserPassword } from '../services/admin.service'

export const useAdminUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAllUsers()
      setUsers(data)
    } catch (err) {
      console.error('Error cargando usuarios:', err)
      setError('No se pudieron cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const editUser = async (userId: string, updates: Partial<User>) => {
    await updateUser(userId, updates)
    await reload()
  }

  const toggleActive = async (userId: string, active: boolean) => {
    await setUserActive(userId, active)
    await reload()
  }

  const changePassword = async (userId: string, newPassword: string) => {
    await resetUserPassword(userId, newPassword)
  }

  return { users, loading, error, reload, editUser, toggleActive, changePassword }
}

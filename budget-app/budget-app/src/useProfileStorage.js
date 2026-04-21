import { useLocalStorage } from './useLocalStorage'

export function useProfiles() {
  const [profiles, setProfiles] = useLocalStorage('bt-profiles', [])
  const [activeId, setActiveId] = useLocalStorage('bt-active-profile', null)

  const activeProfile = profiles.find(p => p.id === activeId) || null

  const createProfile = (name) => {
    const id = 'p' + Date.now()
    const profile = { id, name, createdAt: new Date().toISOString() }
    setProfiles(prev => [...prev, profile])
    setActiveId(id)
    return id
  }

  const switchProfile = (id) => setActiveId(id)

  const renameProfile = (id, name) =>
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, name } : p))

  const deleteProfile = (id) => {
    Object.keys(window.localStorage)
      .filter(k => k.startsWith(id + '-'))
      .forEach(k => window.localStorage.removeItem(k))
    const remaining = profiles.filter(p => p.id !== id)
    setProfiles(remaining)
    if (activeId === id) setActiveId(remaining[0]?.id ?? null)
  }

  return { profiles, activeProfile, activeId, createProfile, switchProfile, renameProfile, deleteProfile }
}

import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { 
  Building2,
  Home,
  User,
  AlertCircle,
  Calendar,
  CheckSquare,
  Calculator,
  MapPin,
  Users,
  Settings,
  FileText,
  Menu,
  X
} from 'lucide-react'

const NavigationMenu = ({ activeTab, onTabChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'negociacao', label: 'Negociação', icon: User },
    { id: 'evento', label: 'Evento', icon: Calendar },
    { id: 'ordem-servico', label: 'OS', icon: CheckSquare },
    { id: 'mapa', label: 'Mapa de Eventos', icon: MapPin },
    { id: 'calculadoras', label: 'Calculadoras', icon: Calculator },
    { id: 'semaforo', label: 'Semáforo (15 dias)', icon: AlertCircle },
    { id: 'equipe', label: 'Equipe / Profissionais', icon: Users, disabled: true },
    { id: 'equipamentos', label: 'Equipamentos', icon: Settings, disabled: true },
    { id: 'relatorios', label: 'Relatórios / Exportações', icon: FileText, disabled: true },
    { id: 'admin', label: 'Administração / Configurações', icon: Settings, disabled: true }
  ]

  const handleTabChange = (tabId) => {
    if (menuItems.find(item => item.id === tabId)?.disabled) return
    onTabChange(tabId)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Header Desktop */}
      <div className="hidden lg:block bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                {/* <h1 className="text-xl font-bold text-gray-900">Techno Motion</h1> */}
                <h1 className="text-xs text-gray-600">Sistema de Logística</h1>
              </div>
            </div>

            {/* Menu Desktop */}
            <nav className="flex items-center space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                const isDisabled = item.disabled

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`
                      flex items-center gap-2 px-3 py-2 text-sm
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}
                    `}
                    onClick={() => handleTabChange(item.id)}
                    disabled={isDisabled}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Button>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Header Mobile */}
      <div className="lg:hidden bg-white shadow-sm border-b">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo Mobile */}
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Techno Motion</h1>
                <p className="text-xs text-gray-600">Sistema de Logística</p>
              </div>
            </div>

            {/* Menu Hamburger */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Menu Mobile Expandido */}
          {mobileMenuOpen && (
            <div className="border-t bg-white">
              <nav className="py-2 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  const isDisabled = item.disabled

                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`
                        w-full justify-start gap-3 px-4 py-3 text-sm
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}
                      `}
                      onClick={() => handleTabChange(item.id)}
                      disabled={isDisabled}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                      {isDisabled && (
                        <span className="ml-auto text-xs text-gray-400">(Em breve)</span>
                      )}
                    </Button>
                  )
                })}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para fechar menu mobile */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

export default NavigationMenu


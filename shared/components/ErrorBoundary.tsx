import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from './Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

// Atrapa cualquier error de renderizado no manejado en toda la app y
// muestra una pantalla amigable en vez de una pantalla blanca o un stack
// trace técnico. "Reintentar" resetea el estado del boundary; si el error
// persiste (ej: bug real de código), recargar la página es el siguiente
// paso natural para el usuario.
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Sin backend de logging de errores todavía — se deja en consola para
    // poder revisar con las herramientas de depuración remota si hace falta.
    console.error('Error no manejado en la app:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-8 text-center">
          <div>
            <span className="text-5xl mb-4 block">😕</span>
            <h1 className="font-display font-bold text-lg text-secondary mb-2">Algo salió mal</h1>
            <p className="text-sm text-gray-400 mb-6">
              Estamos intentando recuperar la aplicación.
            </p>
            <Button onClick={this.handleRetry}>Reintentar</Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

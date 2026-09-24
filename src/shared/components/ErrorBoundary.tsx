import { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorState } from './ErrorState'
import { ERROR_COPY } from '@/shared/constants/stateCopy'

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
        <ErrorState
          fullScreen
          illustration={ERROR_COPY.boundary.illustration}
          title={ERROR_COPY.boundary.title}
          description={ERROR_COPY.boundary.description}
          retryLabel={ERROR_COPY.boundary.cta}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

import { useSyncExternalStore } from 'react'
import { demoStore } from './demo-store'

export function useDemoStore() {
  const state = useSyncExternalStore(
    (onStoreChange) => demoStore.subscribe(onStoreChange),
    () => demoStore.getState(),
    () => demoStore.getState()
  )

  return {
    ...state,
    simulateCardTap: (params: Parameters<typeof demoStore.simulateCardTap>[0]) =>
      demoStore.simulateCardTap(params),
    updateReview: (reviewId: string, status: Parameters<typeof demoStore.updateReview>[1], adminNotes?: string) =>
      demoStore.updateReview(reviewId, status, adminNotes),
    submitRouteChangeRequest: (studentId: string, requestedRouteId: string, reason: string) =>
      demoStore.submitRouteChangeRequest(studentId, requestedRouteId, reason),
    reviewRouteChangeRequest: (requestId: string, status: 'approved' | 'rejected', adminComments?: string) =>
      demoStore.reviewRouteChangeRequest(requestId, status, adminComments),
    toggleSimulation: (run?: boolean) => demoStore.toggleSimulation(run),
    stepBuses: () => demoStore.stepBuses(),
    setSimulationSpeed: (speed: number) => demoStore.setSimulationSpeed(speed),
    setRole: (role: Parameters<typeof demoStore.setRole>[0]) => demoStore.setRole(role),
    completeOnboarding: (role: Parameters<typeof demoStore.completeOnboarding>[0]) => demoStore.completeOnboarding(role),
    setActiveStudent: (studentId: string) => demoStore.setActiveStudent(studentId),
    updateStudent: (studentId: string, patch: any) => demoStore.updateStudent(studentId, patch),
    updateBus: (busId: string, patch: any) => demoStore.updateBus(busId, patch),
    markAlertRead: (alertId: string) => demoStore.markAlertRead(alertId),
    markAllAlertsRead: () => demoStore.markAllAlertsRead(),
    resetToDefault: () => demoStore.resetToDefault(),
  }
}

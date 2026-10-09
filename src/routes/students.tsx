import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
  Users,
  Search,
  Filter,
  CreditCard,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Bus as BusIcon,
  Shield,
  Edit,
  X,
  Check,
  Plus,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import type { Student } from '@/lib/types'
import { updateStudentInDB } from '@/lib/db/actions'

export const Route = createFileRoute('/students')({
  component: StudentManagementPage,
})

function StudentManagementPage() {
  const { students, buses, routes } = useDemoStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>('all')
  const [selectedBusFilter, setSelectedBusFilter] = useState<string>('all')

  // Edit/View modal
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editCardUid, setEditCardUid] = useState('')
  const [editBusId, setEditBusId] = useState('')
  const [editRouteId, setEditRouteId] = useState('')
  const [editEligible, setEditEligible] = useState(true)

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      !searchTerm ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cardUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRoute = selectedRouteFilter === 'all' || s.assignedRouteId === selectedRouteFilter
    const matchesBus = selectedBusFilter === 'all' || s.assignedBusId === selectedBusFilter

    return matchesSearch && matchesRoute && matchesBus
  })

  const openEdit = (s: Student) => {
    setEditingStudent(s)
    setEditCardUid(s.cardUid)
    setEditBusId(s.assignedBusId)
    setEditRouteId(s.assignedRouteId)
    setEditEligible(s.isEligible)
  }

  const saveEdit = () => {
    if (!editingStudent) return
    // In our live store, update student
    editingStudent.cardUid = editCardUid
    editingStudent.assignedBusId = editBusId
    editingStudent.assignedRouteId = editRouteId
    editingStudent.isEligible = editEligible

    // Persist changes to Neon DB
    updateStudentInDB({
      data: {
        id: editingStudent.id,
        cardUid: editCardUid,
        assignedBusId: editBusId,
        assignedRouteId: editRouteId,
        isEligible: editEligible,
      },
    }).catch(console.warn)

    setEditingStudent(null)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono">
              University Transport Directory
            </span>
            <span className="text-xs text-[--color-text-muted] font-mono">SGT Student Affairs</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[--color-text-primary] tracking-tight flex items-center gap-2">
            <span>Student & RFID Pass Management</span>
          </h2>
          <p className="text-xs text-[--color-text-secondary] mt-1">
            Searchable registry of all 50 enrolled students with contactless RFID card bindings and guardian contacts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[--color-text-primary] bg-[--color-surface-base] border border-[--color-border-mid] px-3 py-1.5 rounded-xl font-semibold">
            Enrolled: <b className="text-emerald-600">{students.length} Students</b>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[--color-surface-raised] p-4 rounded-xl border border-[--color-border-subtle] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[--color-text-muted] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, reg number, department…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[--color-surface-base] border border-[--color-border-mid] rounded-xl pl-9 pr-3 py-2 text-[--color-text-primary] placeholder:text-[--color-text-muted] focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedRouteFilter}
            onChange={(e) => setSelectedRouteFilter(e.target.value)}
            className="bg-[--color-surface-base] border border-[--color-border-mid] rounded-xl px-3 py-2 text-[--color-text-primary] focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Routes</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={selectedBusFilter}
            onChange={(e) => setSelectedBusFilter(e.target.value)}
            className="bg-[--color-surface-base] border border-[--color-border-mid] rounded-xl px-3 py-2 text-[--color-text-primary] focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Buses</option>
            {buses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.busNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-[--color-surface-raised] rounded-2xl border border-[--color-border-subtle] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[--color-border-subtle] bg-[--color-surface-base] text-[--color-text-secondary] font-mono text-[11px]">
                <th className="py-3 px-3.5">REG NO</th>
                <th className="py-3 px-3.5">NAME & DEPARTMENT</th>
                <th className="py-3 px-3.5">RFID CARD</th>
                <th className="py-3 px-3.5">ASSIGNED BUS & ROUTE</th>
                <th className="py-3 px-3.5">GUARDIAN CONTACT</th>
                <th className="py-3 px-3.5">STATUS</th>
                <th className="py-3 px-3.5 text-right">MANAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border-subtle] font-sans">
              {filteredStudents.map((student) => {
                const bus = buses.find((b) => b.id === student.assignedBusId)
                const route = routes.find((r) => r.id === student.assignedRouteId)

                return (
                  <tr key={student.id} className="hover:bg-[--color-surface-base] transition-colors">
                    <td className="py-3 px-3.5 font-mono text-[--color-text-muted] font-medium">
                      {student.regNumber}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-[--color-text-primary]">{student.name}</div>
                      <div className="text-[10px] text-[--color-text-muted] truncate max-w-[190px]">
                        {student.department} • {student.year}
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                        {student.cardUid}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-medium text-[--color-text-primary]">{bus?.busNumber}</div>
                      <div className="text-[10px] text-[--color-text-muted] truncate max-w-[150px]">
                        {route?.name}
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="text-[--color-text-primary] font-medium">{student.guardianName}</div>
                      <div className="text-[10px] text-[--color-text-muted] font-mono">{student.guardianPhone}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          student.isEligible
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {student.isEligible ? 'Eligible' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={() => openEdit(student)}
                        className="px-2.5 py-1 rounded-lg bg-[--color-surface-base] hover:bg-[--color-surface-raised] text-[--color-text-primary] border border-[--color-border-mid] text-xs font-semibold flex items-center gap-1 ml-auto shadow-xs"
                      >
                        <Edit className="w-3 h-3 text-emerald-600" />
                        <span>Edit Pass</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[--color-surface-overlay] border border-[--color-border-mid] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-3">
              <div>
                <h3 className="text-base font-bold text-[--color-text-primary]">Edit Transport Assignment</h3>
                <p className="text-xs text-[--color-text-muted]">{editingStudent.name} ({editingStudent.regNumber})</p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-[--color-text-muted] hover:text-[--color-text-primary]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[--color-text-secondary] font-semibold mb-1">
                  Assigned RFID UID
                </label>
                <input
                  type="text"
                  value={editCardUid}
                  onChange={(e) => setEditCardUid(e.target.value)}
                  className="w-full bg-[--color-surface-base] border border-[--color-border-mid] rounded-xl px-3 py-2 text-emerald-700 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[--color-text-secondary] font-semibold mb-1">Assigned Route</label>
                <select
                  value={editRouteId}
                  onChange={(e) => setEditRouteId(e.target.value)}
                  className="w-full bg-[--color-surface-base] border border-[--color-border-mid] rounded-xl px-3 py-2 text-[--color-text-primary] focus:outline-none focus:border-emerald-500"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[--color-text-secondary] font-semibold mb-1">Assigned Bus</label>
                <select
                  value={editBusId}
                  onChange={(e) => setEditBusId(e.target.value)}
                  className="w-full bg-[--color-surface-base] border border-[--color-border-mid] rounded-xl px-3 py-2 text-[--color-text-primary] focus:outline-none focus:border-emerald-500"
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} ({b.plateNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="eligibility"
                  checked={editEligible}
                  onChange={(e) => setEditEligible(e.target.checked)}
                  className="rounded border-[--color-border-mid] text-emerald-600 focus:ring-0"
                />
                <label htmlFor="eligibility" className="text-[--color-text-primary] font-semibold cursor-pointer">
                  Transport Pass Active & Eligible
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[--color-border-subtle]">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[--color-text-secondary] hover:text-[--color-text-primary]"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useAuthStore, useUIStore, useDataStore } from '@/stores'
import { useNotifications } from '@/hooks/use-notifications'
import { useLoading } from '@/hooks/use-loading'
import ProtectedRoute from '@/components/auth/protected-route'
import { DashboardLayout } from '@/components/layout'
import { useState } from 'react'

export default function StoreDemo() {
  const { user, isAuthenticated } = useAuthStore()
  const { theme, setTheme, sidebarOpen, toggleSidebar } = useUIStore()
  const { items, addItem, removeItem, searchQuery, setSearchQuery } = useDataStore()
  const { showSuccess, showError, showWarning, showInfo } = useNotifications()
  const { isLoading, withLoading } = useLoading('demo')
  
  const [newItemTitle, setNewItemTitle] = useState('')

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) {
      showWarning('Invalid Input', 'Please enter a title for the item')
      return
    }

    try {
      await withLoading(async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const newItem = {
          id: Math.random().toString(36).substr(2, 9),
          title: newItemTitle,
          description: `Description for ${newItemTitle}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active' as const,
        }
        
        addItem(newItem)
        setNewItemTitle('')
        showSuccess('Item Added', `"${newItemTitle}" has been added successfully`)
      })
    } catch (error) {
      showError('Failed to Add Item', 'Please try again')
    }
  }

  const handleRemoveItem = (id: string, title: string) => {
    removeItem(id)
    showInfo('Item Removed', `"${title}" has been removed`)
  }

  const testNotifications = () => {
    showSuccess('Success!', 'This is a success notification')
    setTimeout(() => showError('Error!', 'This is an error notification'), 1000)
    setTimeout(() => showWarning('Warning!', 'This is a warning notification'), 2000)
    setTimeout(() => showInfo('Info!', 'This is an info notification'), 3000)
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Zustand Store Demo
          </h1>

            {/* Auth Store Demo */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Auth Store
                </h2>
                <div className="space-y-2">
                  <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                  <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
                  <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* UI Store Demo */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  UI Store
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as any)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={toggleSidebar}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      {sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
                    </button>
                    
                    <button
                      onClick={testNotifications}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Test Notifications
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Store Demo */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Data Store
                </h2>
                
                {/* Add Item */}
                <div className="mb-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      placeholder="Enter item title..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAddItem}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Adding...' : 'Add Item'}
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search items..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Total items: {items.length}
                  </p>
                  {items
                    .filter(item => 
                      !searchQuery || 
                      item.title.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <p className="text-xs text-gray-400">
                          Status: {item.status} | Created: {item.createdAt.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id, item.title)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  {items.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No items yet. Add some items to see them here!
                    </p>
                  )}
                </div>
              </div>
            </div>

          {/* Sidebar State Indicator */}
          {sidebarOpen && (
            <div className="fixed top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg">
              Sidebar is open! (This is just a demo indicator)
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
} 
"use client"
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search, X } from 'lucide-react'

const CustomSelect = ({ value, onChange, options, placeholder, icon: Icon, error, searchable = true }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const searchInputRef = useRef(null)
  const dropdownRef = useRef(null)

  const selectedOption = options.find(opt => opt.value === value)

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.currency?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  // Reset highlighted index when search term changes
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [searchTerm])

  const handleKeyDown = (event) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (event.key) {
      case 'Escape':
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
        break
      case 'ArrowDown':
        event.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case 'Enter':
        event.preventDefault()
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value)
          setIsOpen(false)
          setSearchTerm('')
          setHighlightedIndex(-1)
        }
        break
    }
  }

  const handleOptionClick = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setHighlightedIndex(-1)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none bg-white text-left hover:border-green-400 text-sm ${
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="block truncate">
            {selectedOption ? (
              <div className="flex items-center">
                {selectedOption.flag && <span className="mr-2">{selectedOption.flag}</span>}
                <span>{selectedOption.label}</span>
              </div>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </span>
        </button>
        <ChevronDown 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform pointer-events-none ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
          {searchable && (
            <div className="relative border-b border-gray-100">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-10 py-3 text-sm outline-none bg-gray-50 focus:bg-white transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          
          <div className="max-h-48 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between group ${
                    highlightedIndex === index
                      ? 'bg-green-50 text-green-700'
                      : 'hover:bg-green-50 hover:text-green-700'
                  }`}
                  role="option"
                  aria-selected={value === option.value}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    {option.flag && <span className="text-xl mr-3 flex-shrink-0">{option.flag}</span>}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">
                        {option.currency || option.label}
                      </div>
                      {option.name && option.name !== option.label && (
                        <div className="text-xs text-gray-500 group-hover:text-green-600 truncate">
                          {option.name}
                        </div>
                      )}
                    </div>
                  </div>
                  {value === option.value && (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Aucun résultat trouvé
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomSelect
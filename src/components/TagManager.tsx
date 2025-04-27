import { useState } from 'react';

// Function to generate a tag color based on the tag name
export const getTagColor = (tag: string): string => {
  // Simple hash function to get a number from a string
  const hash = tag.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Use the hash to select one of several predefined color options
  const colorOptions = [
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  ];

  const index = Math.abs(hash) % colorOptions.length;
  return colorOptions[index];
};

type TagManagerProps = {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onTagCreate?: (tag: string) => void;
};

export default function TagManager({
  availableTags,
  selectedTags,
  onTagsChange,
  onTagCreate
}: TagManagerProps) {
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleCreateTag = () => {
    if (!newTag.trim()) return;
    
    const formattedTag = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    
    if (!availableTags.includes(formattedTag)) {
      if (onTagCreate) {
        onTagCreate(formattedTag);
      }
    }
    
    if (!selectedTags.includes(formattedTag)) {
      onTagsChange([...selectedTags, formattedTag]);
    }
    
    setNewTag('');
    setShowTagInput(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {availableTags.length > 0 ? (
          availableTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagSelect(tag)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedTags.includes(tag)
                  ? getTagColor(tag) + ' ring-2 ring-offset-1 ring-indigo-300 dark:ring-indigo-700'
                  : getTagColor(tag) + ' opacity-60 hover:opacity-100'
              }`}
            >
              {tag}
              {selectedTags.includes(tag) && (
                <span className="ml-1">✓</span>
              )}
            </button>
          ))
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            No tags created yet. Add your first tag below.
          </div>
        )}
      </div>

      {showTagInput ? (
        <div className="flex items-center mt-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="Enter new tag (e.g. work, personal, urgent)"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateTag();
              }
              if (e.key === 'Escape') {
                setShowTagInput(false);
                setNewTag('');
              }
            }}
          />
          <button
            type="button"
            onClick={handleCreateTag}
            className="ml-2 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowTagInput(false);
              setNewTag('');
            }}
            className="ml-2 px-3 py-2 bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowTagInput(true)}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center mt-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add new tag
        </button>
      )}
    </div>
  );
}
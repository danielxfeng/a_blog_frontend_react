import { useEffect, useState } from 'react';
import { useForm, UseFormRegister } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, easeInOut, motion } from 'framer-motion';
import { Search } from 'lucide-react';

import MotionButton from '@/components/motion_components/MotionButton';
import MotionInput from '@/components/motion_components/MotionInput';
import { cn } from '@/lib/utils';
import { KeywordSearchQuerySchema } from '@/schema/schema_post';
import useSearchHistoryStore from '@/stores/useSearchHistoryStore';

// Define a type for form input.
type FormValues = { keyword: string };

interface InputComponentProps extends React.InputHTMLAttributes<HTMLInputElement> {
  register: UseFormRegister<FormValues>;
  setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  filtered: string[];
  keyboardNavigationIndex: number;
  setKeyboardNavigationIndex: React.Dispatch<React.SetStateAction<number>>;
  onKeySelect: (keyword: string) => void;
}

type DropdownHistoryProps = {
  showDropdown: boolean;
  keyboardNavigationIndex: number;
  setKeyboardNavigationIndex: React.Dispatch<React.SetStateAction<number>>;
  filtered: string[];
  onSelect: (keyword: string) => void;
};

// Define a component for the input field.
const InputComponent = ({
  register,
  setShowDropdown,
  filtered,
  keyboardNavigationIndex,
  setKeyboardNavigationIndex,
  onKeySelect,
}: InputComponentProps) => (
  <MotionInput
    //We register the keyword to component
    {...register('keyword')}
    autoComplete='off'
    placeholder='Search posts...'
    // We expand the dropdown history when the input is focused
    onFocus={() => {
      setKeyboardNavigationIndex(-1); // Reset the keyboard navigation index
      setShowDropdown(filtered.length > 0); // Show the dropdown if there are filtered items
    }}
    // It's a wired behavior. When user is clicking the dropdown item,
    // the input will be blurred before the click event is fired.
    // Therefore, we delay the closing after the onClick event is fired.
    onBlur={(e) => {
      setTimeout(() => {
        if (!e.relatedTarget || !(e.relatedTarget as HTMLElement).closest('.dropdown-history')) {
          setShowDropdown(false);
        }
      }, 100);
    }}
    onKeyDown={(e) => {
      switch (e.key) {
        case 'Escape': {
          setShowDropdown(false); // Close the dropdown on Escape key
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          if (filtered.length === 0) return; // If the dropdown is empty, do nothing
          setKeyboardNavigationIndex((prev) => {
            return (prev + 1) % filtered.length;
          });
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (filtered.length === 0) return; // If the dropdown is empty, do nothing
          setKeyboardNavigationIndex((prev) => {
            return (prev - 1) % filtered.length;
          });
          break;
        }
        case 'Enter': {
          if (keyboardNavigationIndex >= 0 && keyboardNavigationIndex < filtered.length)
            onKeySelect(filtered[keyboardNavigationIndex]);
          break;
        }
      }
    }}
    className='lg:bg-background h-8 bg-transparent text-sm'
    data-role='search-input'
    aria-label='Search posts'
  />
);

// A component to display the dropdown history
const DropdownHistory = ({
  showDropdown,
  keyboardNavigationIndex,
  setKeyboardNavigationIndex,
  filtered,
  onSelect,
}: DropdownHistoryProps) => {
  return (
    <AnimatePresence>
      {showDropdown && filtered.length > 0 && (
        <motion.ul
          {...easeInOut}
          id='search-suggestion-list'
          role='listbox'
          aria-label='Search suggestions'
          data-role='search-suggestions'
          className='dropdown-history lg:bg-background absolute z-10 mt-1 flex w-full flex-col gap-0 bg-transparent px-2 pb-2 lg:rounded-lg lg:shadow-md'
        >
          {/* Iterate all items */}
          {filtered.map((item, i) => (
            <li
              key={item}
              className={cn(
                'text-foreground lg:text-muted-foreground cursor-pointer overflow-hidden rounded-lg px-4 py-1 text-sm',
                i === keyboardNavigationIndex && 'bg-muted',
              )}
              onPointerDown={() => {
                onSelect(item);
              }}
              onMouseEnter={() => {
                setKeyboardNavigationIndex(i); // Set the keyboard navigation index on hover
              }}
              role='option'
              aria-selected={i === keyboardNavigationIndex}
              id={`search-suggestion-${i}`}
              data-role='search-suggestion-item'
            >
              {item}
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
};

/**
 * @summary SearchBar component
 * @description
 * This component is a search bar that allows users to search for posts by keyword.
 * It populates a dropdown with search history.
 * The history is stored in a Zustand store, which is persisted in localstorage.
 * It runs normally in desktop view, but runs in a popup sheet in mobile view.
 *
 * @remark
 * The SearchBar handles:
 * - The search button: Submits the form.
 * - The suggestions provider for input(keyboard) and dropdown(display).
 * - State lifting for keyboard navigation index.
 *
 * - The input:
 *  - Expands the dropdown history when focused.
 *  - Closes the dropdown history when blurred.
 *  - Updates the keyword to filter the dropdown on change.
 *  - Keyboard listeners:
 *   - `Enter`: Submits the form.
 *   - `Escape`: Closes the dropdown history, and the dropdown should re-open on `keyword` change.
 *   - `ArrowDown or ArrowUp`: Set the keyboard navigation index.
 * - The dropdown history:
 *  - Displays the search history the parent provider.
 *  - Filters the history based on the keyword input.
 *  - Sets the keyboard navigation index on hover or keyboard navigation.
 *  - Sets the input value, submits the form, blurs the input when an item is selected(on click, or on `Enter` key).
 *  - Visual feedback on hover, or keyboard navigation.
 * - Submission:
 *  - Submits the form with the keyword, apply the navigation.
 *
 * Scenarios for clearing the navigation index:
 * - When the user is typing in the input field
 * - When the form is submitted
 * - When the dropdown history is closed
 *
 * @param setOpen = The hook to close the popup sheet. Only needed in mobile view.
 */
const SearchBar = ({ setOpen }: { setOpen?: React.Dispatch<React.SetStateAction<boolean>> }) => {
  // useState to manage the visibility of the dropdown history
  const [showDropdown, setShowDropdown] = useState(false);
  // state lifted to manage the keyboard navigation index
  const [keyboardNavigationIndex, setKeyboardNavigationIndex] = useState(-1);
  // Manage the search history using Zustand store
  const { history, addHistory } = useSearchHistoryStore.getState();
  // for navigate on to the search page
  const navigate = useNavigate();

  // Apply react-hook-form to manage form state and validation
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    // Use zod for schema validation
    resolver: zodResolver(KeywordSearchQuerySchema),
    defaultValues: { keyword: '' },
    // We validate only on submit, bc we don't show errors on input
    // If the input is empty, we don't fire the http request.
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  // Suggestions provider: `keyword` and `filtered`
  // `watch` is efficient here because we have only one input field.
  // It re-renders the component when keyword changes, it's acceptable for this lightweight component.
  const keyword = watch('keyword'); // Watch the keyword input, needed for filtering the dropdown history

  // Filter the suggestions based on the keyword input.
  // useMemo is not suitable here because the filtering is required on each re-render mostly fired by `watch`.
  // and also the history has only a few items, so the performance is not a concern.
  const filtered = keyword
    ? history.filter((item) => item.toLowerCase().includes(keyword.toLowerCase()))
    : history;

  // to handle the side effects
  useEffect(() => {
    // Reset the keyboard navigation index when user is typing
    setKeyboardNavigationIndex(-1);
    setShowDropdown(keyword.length > 0); // Show the dropdown if keyword is not empty
  }, [keyword]);

  // We create a closure to handle the form submission
  const onSubmit = (data: FormValues) => {
    setShowDropdown(false); // Close the dropdown
    addHistory(data.keyword); // Add the keyword to the history
    if (setOpen) setOpen(false); // Close the popup sheet if it exists
    const searchParams = new URLSearchParams({ keyword: data.keyword, offset: '0', limit: '10' });
    reset(); // Reset the form
    setKeyboardNavigationIndex(-1); // Reset the keyboard navigation index
    navigate(`/blog/posts/search?${searchParams.toString()}`); // Navigate to the search page with the keyword
  };

  // onSelect is called when the user selects a keyword from the dropdown history
  const onSelect = (selectedKeyword: string) => {
    setValue('keyword', selectedKeyword);
    // next tick, because the setValue is async.
    setTimeout(() => {
      handleSubmit(onSubmit)();
      setShowDropdown(false);
    }, 0);
  };

  return (
    <div className='relative w-full max-w-md' data-role='search-bar'>
      {/* The form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting}>
          {/* The input field */}
          <InputComponent
            register={register}
            setShowDropdown={setShowDropdown}
            filtered={filtered}
            keyboardNavigationIndex={keyboardNavigationIndex}
            setKeyboardNavigationIndex={setKeyboardNavigationIndex}
            onKeySelect={onSelect}
            role='combobox'
            aria-expanded={showDropdown}
            aria-controls='search-suggestion-list'
            aria-autocomplete='list'
            aria-activedescendant={
              keyboardNavigationIndex >= 0
                ? `search-suggestion-${keyboardNavigationIndex}`
                : undefined
            }
            data-role='search-input-component'
          />

          {/* The search button */}
          <MotionButton
            buttonType='button'
            onClick={() => {
              handleSubmit(onSubmit)(); // Submit the form
            }}
            variant='ghost'
            size='sm'
            supportingText='Search posts'
            icon={<Search />}
            btnClass='absolute top-1/2 right-2 -translate-y-1/2 p-1'
            dataRole='search-button'
          />
        </fieldset>
      </form>

      {/* Dropdown History */}
      <DropdownHistory
        showDropdown={showDropdown}
        filtered={filtered}
        keyboardNavigationIndex={keyboardNavigationIndex}
        onSelect={onSelect}
        setKeyboardNavigationIndex={setKeyboardNavigationIndex}
      />
    </div>
  );
};

export default SearchBar;

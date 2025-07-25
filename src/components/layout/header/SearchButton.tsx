import { useState } from 'react';
import { Search } from 'lucide-react';

import SearchBar from '@/components/layout/header/SearchBar';
import MotionButton from '@/components/motion_components/MotionButton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// It uses in the mobile view only.
const SearchButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className='flex items-center lg:hidden'>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <MotionButton
            buttonType='button'
            variant='secondary'
            size='sm'
            supportingText='Open Search'
            icon={<Search />}
            onClick={() => setOpen(true)}
            dataRole='button-open-search'
          />
        </SheetTrigger>
        <SheetContent
          side='top'
          className='text-foreground bg-background/60 border-border h-screen w-full border p-4 backdrop-blur-sm'
        >
          <SheetHeader>
            <SheetTitle>Search</SheetTitle>
            <SheetDescription>Search posts by title, content, or tags.</SheetDescription>
          </SheetHeader>
          <SearchBar setOpen={setOpen} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SearchButton;

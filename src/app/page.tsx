'use client'

import { db } from './config/db/firebase';

// Import the functions needed from the SDKs
import { collection, doc, addDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

import Image from "next/image";
import { CirclePlus, Loader, Trash } from "lucide-react";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { Id, toast } from 'react-toastify';
import { formatDate } from './utility/func_utilities';
import { useModal } from './modals/Modal';

interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

interface CartItem {
  id: string;
  name: string;
  timestamp: FirestoreTimestamp;
}

export default function Home() {

  const toastNotif = useRef<Id | null>(null)

  const { Modal, openModal, closeModal } = useModal();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [inputText, setInputText] = useState<string>('')

  const [addingItem, startAddItem] = useTransition()
  const addItemToCart = async (itemName: string) => {
    if (!itemName.trim()) {
      // Prevent empty items

      if (toastNotif.current) {
        toast.dismiss(toastNotif.current);
      }
      toastNotif.current = toast.info('You need to enter a text!')
      return
    }

    startAddItem(async () => {

      try {
        await addDoc(collection(db, "cart"), {
          name: itemName,
          timestamp: new Date()
        });

        if (toastNotif.current) {
          toast.dismiss(toastNotif.current);
        }
        toastNotif.current = toast.success('Item added successfully!')
        setInputText(""); // Clear input after saving
      } catch (error) {
        console.error("Error adding item:", error);
        if (toastNotif.current) {
          toast.dismiss(toastNotif.current);
        }
        toastNotif.current = toast.error('Item not added. Check console for info!')
      }
    })
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      addItemToCart(inputText);
    }
  };

  const [itemDeleteID, setDeleteID] = useState('')
  const deleteItem = (itemID: string) => {
    setDeleteID(itemID)
    openModal()
  }
  const [, startDeletingItem] = useTransition()
  const confirmDelete = () => {
    closeModal()
    startDeletingItem(async () => {
      if (toastNotif.current) {
        toast.dismiss(toastNotif.current);
      }
      toastNotif.current = toast.loading('Item deleting...')
      try {
        await deleteDoc(doc(db, "cart", itemDeleteID)); // 🗑️ Delete from Firestore
        console.log("Item deleted successfully!");
        if (toastNotif.current) {
          toast.dismiss(toastNotif.current);
        }
        toastNotif.current = toast.success('Item deleted successfully!')

      } catch (error) {
        console.error("Error deleting item:", error);
        if (toastNotif.current) {
          toast.dismiss(toastNotif.current);
        }
        toastNotif.current = toast.error('Operation error!')
      }
    })
  }

  const [isLoading, setIsLoading] = useState(true);
  const [, startFetchingItems] = useTransition()
  useEffect(() => {
    const q = query(collection(db, "cart"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIsLoading(true);

      startFetchingItems(() => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as CartItem));
        console.log(items)
        setCartItems(items);
        setIsLoading(false);
      })
    },
      (error) => {
        console.log(error)
      }
    );

    return () => unsubscribe();
  }, [])

  return (
    <>
      <Modal title="Delete Item">
        <div className='w-[500px] flex flex-col gap-y-10'>
          <div className='text-center'>
            Are you sure to delete the item?
          </div>
          <div className='flex gap-x-5 justify-end text-sm'>
            <button className='' type="button" onClick={closeModal}>Cancel</button>
            <button type="button" onClick={() => confirmDelete()} className='bg-red-500 text-white rounded px-4 py-2'>Confirm</button>
          </div>
        </div>
      </Modal>
      <div className="md:grid md:grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col md:flex-row md:row-start-2 items-center sm:items-start border border-gray-100 shadow-xs p-5 rounded-lg md:h-[400px]">
          <div className='flex flex-col gap-[32px] md:border-r md:border-r-gray-100 md:pe-5 mb-5 md:mb-0'>
            <div className="flex items-center justify-center w-full">
              <Image
                className=""
                src="/cart.png"
                alt="cart icon logo"
                width={180}
                height={1}
                priority
              />
            </div>
            <div className="flex flex-col gap-y-3 w-full">
              <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyUp={(e) => handleKeyPress(e)} type="text" placeholder="Enter item to add to cart" className="p-3 border border-gray-300 rounded-lg w-full focus:outline-[1.5px] focus:outline-[#00CE65] text-center placeholder:text-gray-200" />
              <button onClick={() => addItemToCart(inputText)} disabled={addingItem} type="button" className="p-3 bg-[#00CE65] hover:bg-[#01B157] transition-colors text-white rounded-lg flex items-center gap-x-2 justify-center disabled:opacity-25">
                {
                  addingItem ? (
                    <div className='animate-spin inline-block'><Loader color="white" /></div>
                  ) : (
                    <>
                      <CirclePlus />
                      <span>Add to Cart</span>
                    </>
                  )
                }
              </button>

            </div>
          </div>

          <div className='w-[300px] md:pl-5 h-full'>
            {
              isLoading && (
                <div className='animate-pulse text-gray-500 h-full space-y-2 text-sm'>
                  {
                    Array.from({ length: 5 }, (_, idx) => (
                      <div className='animate-pulse bg-gray-50 w-full h-[50px] rounded-md' key={`uiysdfg_${idx}`}>&nbsp;</div>
                    ))
                  }
                </div>
              )
            }

            {
              !isLoading && cartItems.length < 1 && (
                <div className='h-full w-full text-gray-400 flex items-center justify-center'>
                  <div className='text-sm'>No data!</div>
                </div>
              )
            }

            {
              !isLoading && (
                <ol className='list list-decimal list-inside space-y-2 h-full overflow-y-scroll'>
                  {
                    cartItems.map((ele, idx) => (
                      <li className='relative p-3 rounded-md border border-gray-100 text-gray-500 flex justify-between items-center group' key={`hgglkhik_${idx}`}>
                        <div className='flex gap-x-1 items-center justify-between w-full'>
                          <span className='font-semibold text-sm'>{ele.name}</span>
                          <span className='text-xs text-gray-400 text-nowrap'>{formatDate(ele.timestamp.seconds * 1000)}</span>
                        </div>
                        <button onClick={() => deleteItem(ele.id)} type="button" className='group-hover:opacity-100 opacity-0 bg-red-50 p-1 rounded hover:bg-red-100 absolute top-[50%] -translate-y-[50%] right-[10px]'><Trash color="#FF0000" size={12} /></button>
                      </li>
                    ))
                  }
                </ol>
              )
            }
          </div>
        </main>
      </div>
    </>
  );
}

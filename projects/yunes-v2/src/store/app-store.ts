'use client';import {create} from 'zustand';type S={menu:boolean;setMenu:(v:boolean)=>void};export const useAppStore=create<S>(set=>({menu:false,setMenu:menu=>set({menu})}));

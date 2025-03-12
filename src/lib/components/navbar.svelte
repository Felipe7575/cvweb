<script lang="ts">
	import type { userWithCreditZodSchema } from "$lib/schemas";
	import type { Session } from "@auth/sveltekit";
	import { z } from "zod";

	let isOpen = false;
 
  let {
    session,
    user
  } : {
    session: Session | null;
    user: z.infer<typeof userWithCreditZodSchema> | null;
  } = $props();

</script>

<div class="navbar bg-base-100 shadow-sm">
    <div class="flex-1">
      <a class="flex w-fit items-center text-xl hover:scale-105 transition-transform" 
        href="/"
      >
      <img alt="Icono" src="/clip.svg" class="w-10 h-10" />
      I Love Curriculum
    </a>
    </div>
    <div class="flex-none">
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img
              alt="Tailwind CSS Navbar component"
              src={session?.user?.image ? session.user.image : "https://www.gravatar.com/avatar/?d=mp"} 
            />
          </div>
        </div>
        <ul
          tabindex="0"
          class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
          <li>
            <a 
              href="/profile"
              class="justify-between">
              Profile
            </a>
          </li>
          <li>
            <a
              href="/login"
              >{session?.user? "Logout" : "Login"}</a>
          </li>
          <li>
            <a
              href="/checkout"
              >Add credits</a>
          </li>
        </ul>
        
        
      </div>
    </div>
  </div>
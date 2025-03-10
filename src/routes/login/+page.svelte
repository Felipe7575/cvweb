
<script lang="ts">
    import { SignIn, SignOut } from "@auth/sveltekit/components"
    import { page } from "$app/stores"

 </script>
  
 <div>
    LOGIN
    <div class="w-3 h-3 bg-blue-300">

    </div>
    <SignIn provider="google" signInPage="signin" />
    <SignOut provider="google" signOutPage="signout" />
 </div> 
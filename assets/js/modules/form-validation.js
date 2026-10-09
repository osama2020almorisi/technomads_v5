import {$$} from "../utils/dom.js";
import {validateField} from "../utils/validation.js";
export function initForms(){
 $$("form[data-validate-form]").forEach(form=>{form.addEventListener("submit",e=>{let ok=true;$$("[data-validate]",form).forEach(f=>{if(!validateField(f))ok=false});if(!ok)e.preventDefault()});$$("[data-validate]",form).forEach(f=>f.addEventListener("blur",()=>validateField(f)))});
}

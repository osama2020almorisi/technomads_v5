export const validators={
 required:v=>String(v??"").trim().length>0,
 email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v??"").trim()),
 min:(v,n)=>String(v??"").trim().length>=n
};
export function validateField(field){const value=field.value, type=field.dataset.validate;let ok=true;if(type==="required")ok=validators.required(value);if(type==="email")ok=validators.email(value);if(type==="required,email")ok=validators.required(value)&&validators.email(value);field.closest(".field")?.classList.toggle("invalid",!ok);return ok}

const Button = (props) => {
    if(!props.disabled) return (
    <button {...props} type="button" 
        class="py-2.5 px-5 me-2 mb-2 text-xs font-kallisto-medium text-white focus:outline-none bg-gradient-to-r from-buttongreen to-elysgreen rounded-2xl border border-elysgold hover:buttongreen hover:text-elysgold focus:z-10 focus:ring-4 focus:ring-buttongreen-100">{props.children}</button>
    )
    return (
        <button {...props} type="button" 
            class="opacity-50 py-2.5 px-5 me-2 mb-2 text-xs font-kallisto-medium text-white focus:outline-none bg-gradient-to-r from-buttongreen to-elysgreen rounded-2xl border border-elysgold hover:buttongreen hover:text-elysgold focus:z-10 focus:ring-4 focus:ring-buttongreen-100">{props.children}</button>
    )
}
export default Button
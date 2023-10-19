/**
 * Create a new toast
 * @param text Test to display in a toast
 * @param duration How long to display the toast for (in ms)
 * @param classes String of classes to apply, for error toasts and whatnot
 * @param doc HTML document/fragment/whatever, so long as it's a Document
 * @param unsafe Use innerHTML instead of innerText when setting toast contents
 */
export function toast (
  text: string = '',
  duration: number = 4500,
  classes: string = '',
  doc: Document = document,
  unsafe: boolean = false
): void {
  // Variable setup
  let toastContainer = doc.getElementsByClassName('__s')[0]
  let styleEl = doc.getElementById('__ss')
  const body = doc.getElementsByTagName('body')[0]

  // Create the toast container if it doesn't exist
  if (!toastContainer) {
    const toastContainerTemp = doc.createElement('div')
    toastContainerTemp.setAttribute('class', '__s')

    body.appendChild(toastContainerTemp)

    toastContainer = doc.getElementsByClassName('__s')[0]
  }

  // Create the style container if it doesn't exist
  if (!styleEl) {
    const styleElTmp = doc.createElement('style')
    styleElTmp.type = 'text/css'
    styleElTmp.setAttribute('id', '__ss')
    styleElTmp.innerHTML = '.__s{display:block;position:fixed;bottom:0;right:5px;min-height:48px;max-width:100vw;z-index:10000}.__s .__t{position:relative;margin:5px 0;width:250px;padding:14px 10px;background-color:#333;text-align:center;line-height:20px;color:#fff;display:block;border-top-right-radius:.25em;border-bottom-right-radius:.25em;animation:fadein .5s;box-shadow:0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12),0 3px 1px -2px rgba(0,0,0,.2);word-break:keep-all}.__s .__t::before{content:"";position:absolute;display:block;background-color:#18a9ff;border-top-left-radius:.25em;border-bottom-left-radius:.25em;width:5px;height:100%;margin-left:-15px;margin-top:-14px}.__s .__t.error::before{background:#f44336}.__s .__t.success::before{background:#4caf50}.__s .__t.warning::before{background:#fdd835}.__s .__t.special::before{background:#C0C}.__s .__t.close{opacity:0;animation:fadeout .5s}@keyframes fadein{from{opacity:0}to{opacity:1}}@keyframes fadeout{from{opacity:1}to{opacity:0;transform:translateY(-50px)}}'

    body.appendChild(styleElTmp)

    styleEl = doc.getElementById('__ss')
  }

  // Create the toast element and set the contents
  const newToast = doc.createElement('span')
  newToast[unsafe ? 'innerHTML' : 'innerText'] = text
  newToast.setAttribute('class', `__t ${classes}`)

  toastContainer.appendChild(newToast)

  // Set the close class after Whatever the duration is
  setTimeout(() => {
    // newToast.className
    newToast.setAttribute('class', `${newToast.className} close`)

    // Delete the node and parent if there's no more toasts
    setTimeout(() => {
      toastContainer.removeChild(newToast)

      if (toastContainer.childNodes.length === 0) {
        toastContainer.remove()
        styleEl?.remove()
      }
    }, 500)
  }, duration)
}

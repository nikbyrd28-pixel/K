import mammoth from 'mammoth'

const result = await mammoth.extractRawText({ path: 'data/Product-Descriptions-Costs-a3ddf7.docx' })
console.log(result.value)

# Skill: Contact Form Implementation (Next.js)

> **Registered Skill:** `.trae/skills/contact-form/SKILL.md` | **Index:** `.trae/skills/INDEX.md`

## Description
Pattern for implementing the contact form with validation, submission to Render backend, and CTA pre-selection logic using Next.js App Router (PRD §3.5, §4.1, §4.2, §4.3).

## When to Use
- Building the Contact Section form
- Handling form validation with React Hook Form + Zod
- Submitting form data to backend API on Render
- Implementing CTA button pre-selection behavior

## Form Fields

Per PRD §3.5:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | text | Yes | Must not be empty |
| Email | email | Yes | Must be valid email format |
| Phone | tel | No | No validation if empty |
| Service Interest | select | Yes | Must select one option |
| Message | textarea | Yes | Must not be empty |

## Implementation

### Form Schema (Zod)

```typescript
// src/lib/validation.ts
import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  phone: z.string().optional(),
  serviceInterest: z.enum(['Study in China', 'Product Sourcing'], {
    required_error: 'Please select a service',
  }),
  message: z.string().min(1, 'Message is required'),
})

export type ContactFormData = z.infer<typeof contactFormSchema>
```

### API Client

```typescript
// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface ContactSubmission {
  name: string
  email: string
  phone?: string
  serviceInterest: 'Study in China' | 'Product Sourcing'
  message: string
}

export async function submitContactForm(data: ContactSubmission) {
  const response = await fetch(`${API_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Submission failed')
  }

  return response.json()
}
```

### Form Component (Client Component)

```typescript
// src/components/ContactForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactFormSchema, ContactFormData } from '@/lib/validation'
import { submitContactForm } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'

export function ContactForm({ defaultService }: { defaultService?: string }) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      serviceInterest: defaultService as ContactFormData['serviceInterest'],
    },
  })

  // Pre-select service when arriving via CTA button (PRD §4.1)
  useEffect(() => {
    if (defaultService) {
      setValue('serviceInterest', defaultService as ContactFormData['serviceInterest'])
    }
  }, [defaultService, setValue])

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      await submitContactForm(data)
      toast({
        title: 'Success',
        description: 'Your message has been sent successfully.',
      })
      reset()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Submission failed. Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <Input {...register('name')} placeholder="Your Name" />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <Input type="email" {...register('email')} placeholder="Your Email" />
        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
      </div>

      {/* Phone (optional) */}
      <div>
        <Input type="tel" {...register('phone')} placeholder="Phone (optional)" />
      </div>

      {/* Service Interest */}
      <div>
        <Select
          value={watch('serviceInterest')}
          onValueChange={(value) =>
            setValue('serviceInterest', value as ContactFormData['serviceInterest'])
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Study in China">Study in China</SelectItem>
            <SelectItem value="Product Sourcing">Product Sourcing</SelectItem>
          </SelectContent>
        </Select>
        {errors.serviceInterest && (
          <p className="text-destructive text-sm">{errors.serviceInterest.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <Textarea {...register('message')} placeholder="Your Message" rows={5} />
        {errors.message && <p className="text-destructive text-sm">{errors.message.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  )
}
```

## CTA Pre-selection Logic (PRD §4.1)

### State-based Pre-selection (Recommended)

```typescript
// src/context/ContactContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ContactContextType {
  selectedService: string | null
  setSelectedService: (service: string | null) => void
}

const ContactContext = createContext<ContactContextType | undefined>(undefined)

export function ContactProvider({ children }: { children: ReactNode }) {
  const [selectedService, setSelectedService] = useState<string | null>(null)

  return (
    <ContactContext.Provider value={{ selectedService, setSelectedService }}>
      {children}
    </ContactContext.Provider>
  )
}

export function useContact() {
  const context = useContext(ContactContext)
  if (!context) throw new Error('useContact must be used within ContactProvider')
  return context
}
```

### CTA Button with Smooth Scroll

```typescript
// src/components/ServiceSection.tsx
'use client'

import { useContact } from '@/context/ContactContext'
import { Button } from '@/components/ui/button'

export function StudyInChinaSection() {
  const { setSelectedService } = useContact()

  const handleCTAClick = () => {
    // Pre-select service (PRD §4.1)
    setSelectedService('Study in China')
    // Smooth scroll to contact section
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Button onClick={handleCTAClick} size="lg">
      Contact Us About Study in China
    </Button>
  )
}
```

### Contact Section with Pre-selection

```typescript
// src/components/sections/ContactSection.tsx
'use client'

import { useContact } from '@/context/ContactContext'
import { ContactForm } from '@/components/ContactForm'

export function ContactSection() {
  const { selectedService } = useContact()

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Contact Us</h2>
        <ContactForm defaultService={selectedService || undefined} />
      </div>
    </section>
  )
}
```

## Validation Rules (PRD §4.2)

### Required Fields
- **Name**: Must not be empty
- **Email**: Must not be empty AND must be valid email format
- **Service Interest**: Must select one option
- **Message**: Must not be empty

### Optional Fields
- **Phone**: No validation if left empty

### Validation Timing
- Validate on form submission (not on blur/change)
- Display field-specific error messages
- Prevent submission if any required field fails

## Submission Process (PRD §4.3)

1. User fills out contact form
2. User clicks Submit button
3. System validates all required fields (client-side via Zod)
4. **If validation passes**:
   - Frontend sends POST to `${NEXT_PUBLIC_API_URL}/api/contact`
   - Backend validates and inserts into PostgreSQL
   - Display success confirmation message
   - Clear form fields
5. **If validation fails**:
   - Display error messages for invalid fields
   - Form retains user input
   - User can correct and resubmit
6. **If database storage fails**:
   - Display error message indicating submission failure
   - User can retry submission

## Edge Cases (PRD §5)

- **Empty required fields**: Display validation errors, prevent submission
- **Invalid email format**: Display email format error, prevent submission
- **Database connection fails**: Display "Submission failed. Please try again later."
- **Multiple rapid clicks**: Disable button during processing
- **Navigate away during submission**: No action required, process terminates

## Best Practices

1. **Disable submit button** during submission to prevent duplicates
2. **Show loading state** on the button
3. **Clear form on success** only after confirmation
4. **Retain user input** on validation failure
5. **Use toast notifications** for success/error feedback
6. **Pre-select service** when arriving via CTA buttons
7. **Use 'use client' directive** for components with state/effects
8. **Validate on both client and backend** for security

## Related Rules
- `form-validation.yml` - Ensures required fields exist
- `api-form-submission.yml` - Ensures contact form uses POST to /api/contact
- `toast-hook.yml` - Ensures toast is used for notifications
- `selectitem.yml` - Ensures SelectItem has non-empty value

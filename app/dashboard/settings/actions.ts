'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSystemSettings() {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' }
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'default',
        }
      });
    }

    return settings;
  } catch (error) {
    console.error('Error fetching system settings:', error);
    throw new Error('Failed to fetch system settings');
  }
}

export async function updateSystemSettings(data: {
  currency: string;
  defaultCreditLimit: number;
  autoApproveAgencies: boolean;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
}) {
  try {
    const updatedSettings = await prisma.systemSettings.update({
      where: { id: 'default' },
      data,
    });

    revalidatePath('/dashboard/settings');
    return { success: true, settings: updatedSettings };
  } catch (error) {
    console.error('Error updating system settings:', error);
    return { success: false, error: 'Failed to update system settings' };
  }
}
